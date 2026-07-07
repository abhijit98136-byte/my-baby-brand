import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { INR, api } from "../lib/api";
import { Trash2, Minus, Plus, Tag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { cart, updateQty, removeFromCart } = useApp();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const nav = useNavigate();

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = coupon ? coupon.discount : 0;
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + gst;

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/coupons/validate", { code, subtotal });
      setCoupon(data);
      toast.success(`Coupon applied: -${INR(data.discount)}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid coupon");
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="cart-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-inkmuted mb-6">Your cart is feeling lonely. Add some little joys!</p>
            <Link to="/shop" className="btn-pill btn-primary inline-flex">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 mt-10">
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="glass-card rounded-3xl p-4 flex gap-4 items-center" data-testid={`cart-item-${item.id}`}>
                  <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.slug}`}><h4 className="font-heading font-medium text-ink">{item.name}</h4></Link>
                    <p className="text-sm font-semibold mt-1">{INR(item.price)}</p>
                  </div>
                  <div className="flex items-center bg-white rounded-full border border-ink/10">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2" data-testid={`cart-decrease-${item.id}`}><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2" data-testid={`cart-increase-${item.id}`}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-inkmuted hover:text-ink" data-testid={`cart-remove-${item.id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <aside className="glass-card rounded-3xl p-6 h-fit space-y-4" data-testid="cart-summary">
              <h3 className="font-heading text-xl font-semibold">Order Summary</h3>
              <div className="flex gap-2">
                <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" data-testid="coupon-input" />
                <button onClick={applyCoupon} className="btn-pill btn-secondary !py-2.5 !px-5 text-sm" data-testid="apply-coupon-btn"><Tag className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 text-sm border-t border-ink/10 pt-3">
                <div className="flex justify-between"><span>Subtotal</span><span>{INR(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{INR(discount)}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : INR(shipping)}</span></div>
                <div className="flex justify-between"><span>GST (5%)</span><span>{INR(gst)}</span></div>
                <div className="flex justify-between font-heading text-lg font-semibold pt-3 border-t border-ink/10"><span>Total</span><span data-testid="cart-total">{INR(total)}</span></div>
              </div>
              <button onClick={() => nav("/checkout", { state: { coupon } })} className="btn-pill btn-primary w-full justify-center" data-testid="checkout-btn">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-inkmuted text-center">{subtotal < 999 ? `Add ${INR(999 - subtotal)} more for FREE shipping` : "🎉 You've unlocked free shipping!"}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
