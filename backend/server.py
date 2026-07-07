from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, Response, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
import jwt
import bcrypt
import random
import string
import requests as httpreq
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'pehli-kilkari-secret-key-2026')
JWT_ALG = 'HS256'

app = FastAPI(title="Pehli Kilkari API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session_token: Optional[str] = Cookie(default=None),
):
    # 1) Try cookie-based emergent session
    token_from_cookie = session_token or request.cookies.get("session_token")
    if token_from_cookie:
        sess = await db.user_sessions.find_one({"session_token": token_from_cookie}, {"_id": 0})
        if sess:
            exp = sess.get("expires_at")
            if isinstance(exp, str):
                try: exp = datetime.fromisoformat(exp)
                except Exception: exp = None
            if exp:
                if exp.tzinfo is None: exp = exp.replace(tzinfo=timezone.utc)
                if exp > datetime.now(timezone.utc):
                    u = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0, "password": 0})
                    if u: return u
    # 2) JWT bearer
    if not creds:
        return None
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        return user
    except Exception:
        return None

async def require_user(user=Depends(get_user)):
    if not user:
        raise HTTPException(401, "Unauthorized")
    return user

async def require_admin(user=Depends(require_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user

# ===== Models =====
class SignupIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None

class AddressIn(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    is_default: bool = False

class ProductIn(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    mrp: float
    category: str
    images: List[str]
    stock: int = 50
    rating: float = 4.5
    reviews_count: int = 0
    tags: List[str] = []
    collection: Optional[str] = None
    featured: bool = False

class CartItemIn(BaseModel):
    product_id: str
    quantity: int = 1

class OrderIn(BaseModel):
    items: List[CartItemIn]
    address_id: str
    payment_method: Literal["razorpay", "cod"]
    coupon_code: Optional[str] = None

class CouponIn(BaseModel):
    code: str
    discount_pct: float
    min_order: float = 0
    active: bool = True

class ReviewIn(BaseModel):
    product_id: str
    rating: int
    comment: str

# ===== Auth =====
@api_router.post("/auth/signup")
async def signup(data: SignupIn):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id, "name": data.name, "email": data.email,
        "phone": data.phone, "password": hash_pw(data.password),
        "role": "user", "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = make_token(user_id, "user")
    return {"token": token, "user": {"id": user_id, "name": data.name, "email": data.email, "role": "user"}}

@api_router.post("/auth/login")
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email})
    if not user or not check_pw(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user.get("role", "user"))
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user.get("role", "user")}}

@api_router.post("/auth/otp/request")
async def otp_request(data: OTPRequest):
    otp = ''.join(random.choices(string.digits, k=6))
    await db.otps.update_one(
        {"phone": data.phone},
        {"$set": {"phone": data.phone, "otp": otp, "created_at": now_iso()}},
        upsert=True,
    )
    # MOCKED OTP - in production, send via SMS
    return {"message": "OTP sent", "demo_otp": otp}

@api_router.post("/auth/otp/verify")
async def otp_verify(data: OTPVerify):
    record = await db.otps.find_one({"phone": data.phone})
    if not record or record["otp"] != data.otp:
        raise HTTPException(401, "Invalid OTP")
    user = await db.users.find_one({"phone": data.phone})
    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id, "name": data.name or f"User-{data.phone[-4:]}",
            "email": f"{data.phone}@pehlikilkari.user", "phone": data.phone,
            "password": "", "role": "user", "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    token = make_token(user["id"], user.get("role", "user"))
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user.get("role", "user"), "phone": user.get("phone")}}

@api_router.get("/auth/me")
async def me(user=Depends(require_user)):
    return user

@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(400, "Missing X-Session-ID header")
    try:
        r = httpreq.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        raise HTTPException(401, f"Auth exchange failed: {e}")

    email = data.get("email"); name = data.get("name"); picture = data.get("picture", "")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(400, "Invalid session response")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id, "name": name or "Google User", "email": email,
            "picture": picture, "phone": "", "password": "", "role": "user",
            "auth_provider": "google", "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one({"id": user["id"]}, {"$set": {"picture": picture, "name": name or user.get("name")}})

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {"user_id": user["id"], "session_token": session_token,
                  "expires_at": expires_at.isoformat(), "created_at": now_iso()}},
        upsert=True,
    )
    response.set_cookie(
        "session_token", session_token,
        httponly=True, secure=True, samesite="none",
        max_age=7*24*3600, path="/",
    )
    safe = {k: v for k, v in user.items() if k != "password"}
    return {"user": safe, "session_token": session_token}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    tok = request.cookies.get("session_token")
    if tok:
        await db.user_sessions.delete_one({"session_token": tok})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}

# ===== Products =====
@api_router.get("/products")
async def list_products(category: Optional[str] = None, collection: Optional[str] = None,
                        featured: Optional[bool] = None, q: Optional[str] = None, limit: int = 100):
    query = {}
    if category: query["category"] = category
    if collection: query["collection"] = collection
    if featured is not None: query["featured"] = featured
    if q: query["name"] = {"$regex": q, "$options": "i"}
    items = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return items

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Not found")
    return p

@api_router.get("/categories")
async def list_categories():
    items = await db.categories.find({}, {"_id": 0}).to_list(100)
    return items

@api_router.get("/collections")
async def list_collections():
    items = await db.collections.find({}, {"_id": 0}).to_list(100)
    return items

# ===== Admin Products =====
@api_router.post("/admin/products")
async def add_product(data: ProductIn, admin=Depends(require_admin)):
    p = data.model_dump()
    p["id"] = str(uuid.uuid4())
    p["created_at"] = now_iso()
    await db.products.insert_one(p)
    return {k: v for k, v in p.items() if k != "_id"}

@api_router.put("/admin/products/{pid}")
async def update_product(pid: str, data: ProductIn, admin=Depends(require_admin)):
    await db.products.update_one({"id": pid}, {"$set": data.model_dump()})
    return {"ok": True}

@api_router.delete("/admin/products/{pid}")
async def del_product(pid: str, admin=Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}

# ===== Cart (server-side optional, frontend uses localStorage too) =====
# We'll just compute order totals server-side at checkout.

# ===== Wishlist =====
@api_router.get("/wishlist")
async def get_wishlist(user=Depends(require_user)):
    items = await db.wishlist.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    return items

@api_router.post("/wishlist/{pid}")
async def add_wishlist(pid: str, user=Depends(require_user)):
    await db.wishlist.update_one(
        {"user_id": user["id"], "product_id": pid},
        {"$set": {"user_id": user["id"], "product_id": pid, "added_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}

@api_router.delete("/wishlist/{pid}")
async def del_wishlist(pid: str, user=Depends(require_user)):
    await db.wishlist.delete_one({"user_id": user["id"], "product_id": pid})
    return {"ok": True}

# ===== Addresses =====
@api_router.get("/addresses")
async def get_addresses(user=Depends(require_user)):
    items = await db.addresses.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return items

@api_router.post("/addresses")
async def add_address(data: AddressIn, user=Depends(require_user)):
    a = data.model_dump()
    a["id"] = str(uuid.uuid4())
    a["user_id"] = user["id"]
    a["created_at"] = now_iso()
    if a["is_default"]:
        await db.addresses.update_many({"user_id": user["id"]}, {"$set": {"is_default": False}})
    await db.addresses.insert_one(a)
    return {k: v for k, v in a.items() if k != "_id"}

@api_router.delete("/addresses/{aid}")
async def del_address(aid: str, user=Depends(require_user)):
    await db.addresses.delete_one({"id": aid, "user_id": user["id"]})
    return {"ok": True}

# ===== Coupons =====
@api_router.post("/coupons/validate")
async def validate_coupon(payload: dict):
    code = payload.get("code", "").upper()
    subtotal = float(payload.get("subtotal", 0))
    c = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Invalid coupon")
    if subtotal < c.get("min_order", 0):
        raise HTTPException(400, f"Minimum order ₹{c['min_order']} required")
    discount = round(subtotal * c["discount_pct"] / 100, 2)
    return {"code": code, "discount": discount, "discount_pct": c["discount_pct"]}

@api_router.get("/admin/coupons")
async def list_coupons(admin=Depends(require_admin)):
    return await db.coupons.find({}, {"_id": 0}).to_list(100)

@api_router.post("/admin/coupons")
async def add_coupon(data: CouponIn, admin=Depends(require_admin)):
    c = data.model_dump()
    c["code"] = c["code"].upper()
    c["id"] = str(uuid.uuid4())
    await db.coupons.update_one({"code": c["code"]}, {"$set": c}, upsert=True)
    return c

# ===== Orders =====
@api_router.post("/orders")
async def create_order(data: OrderIn, user=Depends(require_user)):
    # compute totals
    subtotal = 0.0
    items_detail = []
    for it in data.items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        line = p["price"] * it.quantity
        subtotal += line
        items_detail.append({
            "product_id": p["id"], "name": p["name"], "price": p["price"],
            "image": p["images"][0] if p.get("images") else "",
            "quantity": it.quantity, "subtotal": line,
        })
    discount = 0.0
    coupon = None
    if data.coupon_code:
        c = await db.coupons.find_one({"code": data.coupon_code.upper(), "active": True})
        if c and subtotal >= c.get("min_order", 0):
            discount = round(subtotal * c["discount_pct"] / 100, 2)
            coupon = c["code"]
    shipping = 0 if subtotal >= 999 else 49
    gst = round((subtotal - discount) * 0.05, 2)
    total = round(subtotal - discount + shipping + gst, 2)

    addr = await db.addresses.find_one({"id": data.address_id, "user_id": user["id"]}, {"_id": 0})
    if not addr:
        raise HTTPException(400, "Invalid address")

    order_id = str(uuid.uuid4())
    order_number = "PK" + ''.join(random.choices(string.digits, k=8))
    order = {
        "id": order_id, "order_number": order_number, "user_id": user["id"],
        "items": items_detail, "address": addr, "subtotal": subtotal,
        "discount": discount, "coupon": coupon, "shipping": shipping,
        "gst": gst, "total": total, "payment_method": data.payment_method,
        "payment_status": "paid" if data.payment_method == "razorpay" else "pending",
        "status": "confirmed", "tracking": [
            {"stage": "Order Placed", "at": now_iso(), "done": True},
            {"stage": "Confirmed", "at": now_iso(), "done": True},
            {"stage": "Packed", "at": "", "done": False},
            {"stage": "Shipped", "at": "", "done": False},
            {"stage": "Out for Delivery", "at": "", "done": False},
            {"stage": "Delivered", "at": "", "done": False},
        ],
        "created_at": now_iso(),
    }
    await db.orders.insert_one(order)
    return {k: v for k, v in order.items() if k != "_id"}

@api_router.get("/orders")
async def my_orders(user=Depends(require_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.get("/orders/track/{order_number}")
async def track_order(order_number: str):
    o = await db.orders.find_one({"order_number": order_number}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Order not found")
    return o

@api_router.post("/payment/razorpay/mock")
async def mock_razorpay(payload: dict):
    # MOCKED Razorpay - returns success immediately
    return {"success": True, "payment_id": "pay_" + uuid.uuid4().hex[:14], "method": payload.get("method", "upi")}

# ===== Admin Orders =====
@api_router.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.put("/admin/orders/{oid}/status")
async def update_order_status(oid: str, payload: dict, admin=Depends(require_admin)):
    status = payload.get("status")
    await db.orders.update_one({"id": oid}, {"$set": {"status": status}})
    return {"ok": True}

@api_router.get("/admin/users")
async def admin_users(admin=Depends(require_admin)):
    return await db.users.find({}, {"_id": 0, "password": 0}).to_list(500)

@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    total_sales = sum(o.get("total", 0) for o in orders)
    user_count = await db.users.count_documents({})
    prod_count = await db.products.count_documents({})
    return {
        "total_sales": total_sales,
        "orders_count": len(orders),
        "users_count": user_count,
        "products_count": prod_count,
        "recent_orders": orders[:10],
    }

# ===== Reviews =====
@api_router.get("/reviews")
async def get_reviews(product_id: Optional[str] = None):
    q = {"product_id": product_id} if product_id else {}
    return await db.reviews.find(q, {"_id": 0}).to_list(200)

@api_router.post("/reviews")
async def add_review(data: ReviewIn, user=Depends(require_user)):
    r = data.model_dump()
    r["id"] = str(uuid.uuid4())
    r["user_id"] = user["id"]
    r["user_name"] = user["name"]
    r["created_at"] = now_iso()
    await db.reviews.insert_one(r)
    return {k: v for k, v in r.items() if k != "_id"}

# ===== Newsletter =====
@api_router.post("/newsletter")
async def newsletter(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(400, "Email required")
    await db.newsletter.update_one({"email": email}, {"$set": {"email": email, "at": now_iso()}}, upsert=True)
    return {"ok": True}

# ===== Contact =====
@api_router.post("/contact")
async def contact(payload: dict):
    payload["id"] = str(uuid.uuid4())
    payload["at"] = now_iso()
    await db.contact_messages.insert_one(payload)
    return {"ok": True}

@api_router.get("/")
async def root():
    return {"message": "Pehli Kilkari API", "version": "1.0"}

# ===== Seed =====
SEED_CATEGORIES = [
    {"slug": "baby-gift-sets", "name": "Baby Gift Sets", "color": "#FFE6F0", "icon": "Gift"},
    {"slug": "baby-caps", "name": "Baby Caps", "color": "#DFF4FF", "icon": "Crown"},
    {"slug": "baby-socks", "name": "Baby Socks", "color": "#F2E8FF", "icon": "Footprints"},
    {"slug": "baby-shoes", "name": "Baby Shoes", "color": "#E8FFF1", "icon": "ShoppingBag"},
    {"slug": "baby-sandals", "name": "Baby Sandals", "color": "#FFE6F0", "icon": "Sun"},
    {"slug": "baby-towels", "name": "Baby Towels", "color": "#DFF4FF", "icon": "Droplets"},
    {"slug": "baby-sleeping-bags", "name": "Baby Sleeping Bags", "color": "#F2E8FF", "icon": "Moon"},
    {"slug": "baby-wipes", "name": "Baby Wipes", "color": "#E8FFF1", "icon": "Sparkles"},
    {"slug": "water-bottles", "name": "Water Bottles", "color": "#DFF4FF", "icon": "CupSoda"},
    {"slug": "painting-kits", "name": "Painting Kits", "color": "#FFE6F0", "icon": "Palette"},
    {"slug": "piggy-banks", "name": "Piggy Banks", "color": "#F2E8FF", "icon": "PiggyBank"},
    {"slug": "colour-set", "name": "Colour Set", "color": "#E8FFF1", "icon": "Paintbrush"},
    {"slug": "acrylic-colour", "name": "Acrylic Colour", "color": "#FFE6F0", "icon": "Brush"},
    {"slug": "table-tennis", "name": "Table Tennis", "color": "#DFF4FF", "icon": "Trophy"},
    {"slug": "stationary", "name": "Stationary", "color": "#F2E8FF", "icon": "Pencil"},
    {"slug": "lunchbox", "name": "Lunchbox", "color": "#E8FFF1", "icon": "Utensils"},
]

SEED_COLLECTIONS = [
    {"slug": "newborn-essentials", "name": "Newborn Essentials", "image": "https://images.pexels.com/photos/32046405/pexels-photo-32046405.jpeg"},
    {"slug": "baby-care", "name": "Baby Care", "image": "https://images.unsplash.com/photo-1566958769312-82cef41d19ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGJhYnklMjBwcm9kdWN0c3xlbnwwfHx8fDE3ODE4NTgwNTd8MA&ixlib=rb-4.1.0&q=85"},
    {"slug": "baby-clothing", "name": "Baby Clothing", "image": "https://images.pexels.com/photos/18112837/pexels-photo-18112837.jpeg"},
    {"slug": "school-essentials", "name": "School Essentials", "image": "https://images.pexels.com/photos/6692935/pexels-photo-6692935.jpeg"},
    {"slug": "creative-learning-kits", "name": "Creative Learning Kits", "image": "https://images.pexels.com/photos/7470709/pexels-photo-7470709.jpeg"},
]

PRODUCT_IMAGES = [
    "https://images.unsplash.com/photo-1759563876829-47c081a2afd9",
    "https://images.pexels.com/photos/11116578/pexels-photo-11116578.jpeg",
    "https://images.pexels.com/photos/7470709/pexels-photo-7470709.jpeg",
    "https://images.pexels.com/photos/32046405/pexels-photo-32046405.jpeg",
    "https://images.pexels.com/photos/18112837/pexels-photo-18112837.jpeg",
    "https://images.pexels.com/photos/6692935/pexels-photo-6692935.jpeg",
    "https://images.pexels.com/photos/16145651/pexels-photo-16145651.jpeg",
    "https://images.pexels.com/photos/36039/baby-twins-brother-and-sister-one-hundred-days.jpg",
    "https://images.unsplash.com/photo-1566958769312-82cef41d19ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGJhYnklMjBwcm9kdWN0c3xlbnwwfHx8fDE3ODE4NTgwNTd8MA&ixlib=rb-4.1.0&q=85",
]

PRODUCT_TEMPLATES = [
    ("baby-gift-sets", "Cloud Dream Gift Set", "newborn-essentials", 1799, 2499, True),
    ("baby-gift-sets", "Royal Welcome Hamper", "newborn-essentials", 2499, 3299, True),
    ("baby-caps", "Bunny Ear Knit Cap", "baby-clothing", 399, 599, False),
    ("baby-caps", "Pastel Bow Bonnet", "baby-clothing", 449, 649, True),
    ("baby-socks", "Cloud Cotton Sock Pack (5)", "baby-clothing", 349, 499, False),
    ("baby-socks", "Anti-Slip Animal Socks", "baby-clothing", 299, 449, False),
    ("baby-shoes", "First Step Soft Sole", "baby-clothing", 899, 1299, True),
    ("baby-shoes", "Velvet Crib Booties", "baby-clothing", 699, 999, False),
    ("baby-sandals", "Summer Breeze Sandals", "baby-clothing", 599, 899, False),
    ("baby-towels", "Hooded Bamboo Bath Towel", "baby-care", 799, 1199, True),
    ("baby-towels", "Organic Muslin Washcloth Set", "baby-care", 449, 699, False),
    ("baby-sleeping-bags", "Starlight Swaddle Sleeping Bag", "newborn-essentials", 1299, 1799, True),
    ("baby-sleeping-bags", "Cocoon Wearable Blanket", "newborn-essentials", 1499, 1999, False),
    ("baby-wipes", "Aloe Gentle Wipes (72ct)", "baby-care", 249, 349, False),
    ("baby-wipes", "Coconut Water Wipes Pack", "baby-care", 299, 399, True),
    ("water-bottles", "Sippy Cloud Water Bottle", "school-essentials", 449, 649, False),
    ("water-bottles", "Insulated Toddler Sipper", "school-essentials", 699, 999, True),
    ("painting-kits", "Little Picasso Paint Kit", "creative-learning-kits", 899, 1299, True),
    ("painting-kits", "My First Art Studio", "creative-learning-kits", 1199, 1599, False),
    ("piggy-banks", "Ceramic Cloud Piggy Bank", "creative-learning-kits", 599, 799, False),
    ("piggy-banks", "Wooden Smart Save Bank", "creative-learning-kits", 799, 1099, False),
    ("colour-set", "24 Shade Crayon Set", "creative-learning-kits", 199, 299, False),
    ("colour-set", "Premium Sketch Pen Pack", "creative-learning-kits", 299, 449, False),
    ("acrylic-colour", "Acrylic Color Kit 12", "creative-learning-kits", 449, 649, False),
    ("table-tennis", "Mini Table Tennis Set", "school-essentials", 1299, 1799, False),
    ("stationary", "Back to School Bundle", "school-essentials", 799, 1099, True),
    ("stationary", "Pastel Notebook Trio", "school-essentials", 349, 499, False),
    ("lunchbox", "Bento Steel Lunchbox", "school-essentials", 599, 899, True),
    ("lunchbox", "Insulated Lunch Tote", "school-essentials", 799, 1199, False),
]

async def seed():
    if await db.products.count_documents({}) > 0:
        return
    await db.categories.delete_many({})
    await db.categories.insert_many([dict(c) for c in SEED_CATEGORIES])
    await db.collections.delete_many({})
    await db.collections.insert_many([dict(c) for c in SEED_COLLECTIONS])

    products = []
    for i, (cat, name, coll, price, mrp, featured) in enumerate(PRODUCT_TEMPLATES):
        img = PRODUCT_IMAGES[i % len(PRODUCT_IMAGES)]
        img2 = PRODUCT_IMAGES[(i + 3) % len(PRODUCT_IMAGES)]
        products.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "slug": name.lower().replace(" ", "-").replace("(", "").replace(")", ""),
            "description": f"Premium {name} crafted from soft, baby-safe materials. Lovingly designed for comfort, safety, and lasting joy. Hypoallergenic, OEKO-TEX certified.",
            "price": price, "mrp": mrp, "category": cat,
            "images": [img, img2], "stock": random.randint(15, 80),
            "rating": round(random.uniform(4.2, 5.0), 1),
            "reviews_count": random.randint(15, 240),
            "tags": ["bestseller"] if featured else [],
            "collection": coll, "featured": featured,
            "created_at": now_iso(),
        })
    await db.products.insert_many(products)

    # Coupons
    await db.coupons.delete_many({})
    await db.coupons.insert_many([
        {"id": str(uuid.uuid4()), "code": "WELCOME10", "discount_pct": 10, "min_order": 499, "active": True},
        {"id": str(uuid.uuid4()), "code": "BABY20", "discount_pct": 20, "min_order": 1499, "active": True},
        {"id": str(uuid.uuid4()), "code": "FIRSTKILKARI", "discount_pct": 15, "min_order": 999, "active": True},
    ])

    # Seed admin
    if not await db.users.find_one({"email": "admin@pehlikilkari.com"}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "Admin",
            "email": "admin@pehlikilkari.com",
            "password": hash_pw("Admin@123"),
            "phone": "9999999999",
            "role": "admin", "created_at": now_iso(),
        })

    # Seed reviews
    sample_reviews = [
        {"name": "Aisha M.", "rating": 5, "comment": "Absolutely love the quality! My baby's skin is so sensitive but no issues at all."},
        {"name": "Priya S.", "rating": 5, "comment": "Premium packaging, soft fabrics. Will buy again!"},
        {"name": "Rohan K.", "rating": 4, "comment": "Got the gift set for my niece. Family loved it!"},
        {"name": "Neha P.", "rating": 5, "comment": "Best baby brand I've found in India. Carter's level quality."},
        {"name": "Tanvi R.", "rating": 5, "comment": "Adorable designs, fast delivery, great prices."},
        {"name": "Karan D.", "rating": 4, "comment": "Highly recommended for newborn essentials."},
    ]
    await db.reviews.delete_many({"product_id": "homepage"})
    for r in sample_reviews:
        await db.reviews.insert_one({
            "id": str(uuid.uuid4()), "product_id": "homepage",
            "user_id": "demo", "user_name": r["name"],
            "rating": r["rating"], "comment": r["comment"],
            "created_at": now_iso(),
        })

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await seed()
    logger.info("Pehli Kilkari API ready")

@app.on_event("shutdown")
async def shutdown():
    client.close()
