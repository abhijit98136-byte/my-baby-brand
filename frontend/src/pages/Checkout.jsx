import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, INR } from "../lib/api";
import { useApp } from "../lib/store";
import { toast } from "sonner";
import { Plus, Lock, Wallet, CreditCard, Smartphone } from "lucide-react";

export default function Checkout() {
  const { cart, user, clearCart } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const coupon = loc.state?.coupon;
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newAddr, setNewAddr] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [showAddr, setShowAddr] = useState(false);
  const [payment, setPayment] = useState("razorpay");
  const [method, setMethod] = useState("upi");
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = coupon?.discount || 0;
  const shipping = subtotal >= 999 ? 0 : 49;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + gst;

  useEffect(() => {
    if (!user) { nav("/auth?next=/checkout"); return; }
    if (cart.length === 0) { nav("/cart"); return; }
    api.get("/addresses").then(r => { setAddresses(r.data); if (r.data.length) setSelected(r.data[0].id); else setShowAddr(true); });
  }, [user, cart.length]);

  const saveAddress = async () => {
    try {
      const { data } = await api.post("/addresses", newAddr);
      setAddresses([...addresses, data]); setSelected(data.id); setShowAddr(false);
      setNewAddr({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
      toast.success("Address saved");
    } catch { toast.error("Could not save address"); }
  };

  const placeOrder = async () => {
    if (!selected) { toast.error("Please select an address"); return; }
    setPlacing(true);
    try {
      if (payment === "razorpay") {
        await api.post("/payment/razorpay/mock", { amount: total, method });
      }
      const { data } = await api.post("/orders", {
        items: cart.map(c => ({ product_id: c.id, quantity: c.qty })),
        address_id: selected,
        payment_method: payment,
        coupon_code: coupon?.code || null,
      });
      clearCart();
      toast.success("Order placed!");
      nav(`/order-success/${data.order_number}`);
    } catch (e) { toast.error(e.response?.data?.detail || "Order failed"); }
    finally { setPlacing(false); }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="checkout-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card rounded-3xl p-6">
            <h3 className="font-heading text-xl font-semibold mb-4">Delivery Address</h3>
            <div className="space-y-3">
              {addresses.map(a => (
                <label key={a.id} className={`block p-4 rounded-2xl border cursor-pointer ${selected === a.id ? 'border-ink bg-cream' : 'border-ink/10 bg-white/60'}`}>
                  <input type="radio" checked={selected === a.id} onChange={() => setSelected(a.id)} className="mr-2" data-testid={`addr-${a.id}`} />
                  <span className="font-semibold">{a.full_name}</span> · {a.phone}
                  <div className="text-sm text-inkmuted ml-6">{a.line1}, {a.line2 && `${a.line2}, `}{a.city}, {a.state} - {a.pincode}</div>
                </label>
              ))}
            </div>
            {!showAddr && <button onClick={() => setShowAddr(true)} className="mt-4 text-sm font-semibold inline-flex items-center gap-1" data-testid="add-address-btn"><Plus className="w-4 h-4" /> Add new address</button>}
            {showAddr && (
              <div className="mt-4 space-y-3 p-5 bg-cream rounded-2xl" data-testid="new-address-form">
                <div className="grid md:grid-cols-2 gap-3">
                  {[['full_name','Full Name'],['phone','Phone'],['line1','Address Line 1'],['line2','Line 2 (optional)'],['city','City'],['state','State'],['pincode','Pincode']].map(([k,l])=>(
                    <input key={k} placeholder={l} value={newAddr[k]} onChange={e=>setNewAddr({...newAddr,[k]:e.target.value})} className="px-4 py-3 rounded-full bg-white border border-ink/10 text-sm" data-testid={`addr-input-${k}`} />
                  ))}
                </div>
                <button onClick={saveAddress} className="btn-pill btn-primary text-sm" data-testid="save-address-btn">Save Address</button>
              </div>
            )}
          </section>

          <section className="glass-card rounded-3xl p-6" data-testid="payment-section">
            <h3 className="font-heading text-xl font-semibold mb-4">Payment Method</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <label className={`p-4 rounded-2xl border cursor-pointer ${payment === 'razorpay' ? 'border-ink bg-cream' : 'border-ink/10 bg-white/60'}`}>
                <input type="radio" checked={payment === 'razorpay'} onChange={() => setPayment('razorpay')} className="mr-2" data-testid="pay-razorpay" />
                <span className="font-semibold">Razorpay (UPI/Card/Net Banking)</span>
                <p className="text-xs text-inkmuted ml-6 mt-1">Pay securely via UPI, Google Pay, PhonePe, Paytm, Credit/Debit Card, Net Banking</p>
              </label>
              <label className={`p-4 rounded-2xl border cursor-pointer ${payment === 'cod' ? 'border-ink bg-cream' : 'border-ink/10 bg-white/60'}`}>
                <input type="radio" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="mr-2" data-testid="pay-cod" />
                <span className="font-semibold">Cash on Delivery</span>
                <p className="text-xs text-inkmuted ml-6 mt-1">Pay when you receive your order</p>
              </label>
            </div>
            {payment === 'razorpay' && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[['upi','UPI',Smartphone],['gpay','GPay',Smartphone],['phonepe','PhonePe',Smartphone],['paytm','Paytm',Wallet],['card','Card',CreditCard],['netbanking','Net Banking',Lock]].map(([k,l,Ic])=>(
                  <button key={k} onClick={()=>setMethod(k)} className={`p-3 rounded-xl text-left ${method===k?'bg-ink text-cream':'bg-white border border-ink/10'}`} data-testid={`pay-method-${k}`}><Ic className="w-4 h-4 mb-1" />{l}</button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="glass-card rounded-3xl p-6 h-fit sticky top-24">
          <h3 className="font-heading text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {cart.map(c=>(
              <div key={c.id} className="flex gap-3 text-sm">
                <img src={c.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="flex-1"><p className="font-medium line-clamp-1">{c.name}</p><p className="text-inkmuted text-xs">Qty {c.qty}</p></div>
                <span className="font-semibold">{INR(c.price * c.qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm mt-4 border-t border-ink/10 pt-3">
            <div className="flex justify-between"><span>Subtotal</span><span>{INR(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({coupon?.code})</span><span>-{INR(discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : INR(shipping)}</span></div>
            <div className="flex justify-between"><span>GST (5%)</span><span>{INR(gst)}</span></div>
            <div className="flex justify-between font-heading text-lg font-semibold pt-3 border-t border-ink/10"><span>Total</span><span data-testid="checkout-total">{INR(total)}</span></div>
          </div>
          <button onClick={placeOrder} disabled={placing} className="btn-pill btn-primary w-full justify-center mt-5" data-testid="place-order-btn">
            <Lock className="w-4 h-4" /> {placing ? "Processing..." : `Place Order · ${INR(total)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}
