import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { CheckCircle2, Circle, Package } from "lucide-react";

export default function TrackOrder() {
  const { orderNumber: paramOrder } = useParams();
  const [orderNumber, setOrderNumber] = useState(paramOrder || "");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const fetchOrder = async (num) => {
    try { const { data } = await api.get(`/orders/track/${num}`); setOrder(data); setErr(""); }
    catch { setErr("Order not found"); setOrder(null); }
  };

  useEffect(() => { if (paramOrder) fetchOrder(paramOrder); }, [paramOrder]);

  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="track-order-page">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl font-medium">Track Your Order</h1>
        <div className="glass-card rounded-3xl p-6 mt-8 flex gap-3">
          <input value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder="Enter order number (e.g. PK12345678)" className="flex-1 px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="track-input" />
          <button onClick={() => fetchOrder(orderNumber)} className="btn-pill btn-primary" data-testid="track-btn">Track</button>
        </div>
        {err && <p className="text-red-600 text-sm mt-3">{err}</p>}
        {order && (
          <div className="glass-card rounded-3xl p-6 mt-6" data-testid="order-tracking-info">
            <div className="flex items-center justify-between">
              <div><p className="text-inkmuted text-sm">Order</p><p className="font-heading font-semibold">{order.order_number}</p></div>
              <div className="text-right"><p className="text-inkmuted text-sm">Total</p><p className="font-heading font-semibold">₹{order.total}</p></div>
            </div>
            <div className="mt-6 space-y-4">
              {order.tracking.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  {t.done ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-inkmuted" />}
                  <div>
                    <p className={`font-medium ${t.done ? 'text-ink' : 'text-inkmuted'}`}>{t.stage}</p>
                    {t.at && <p className="text-xs text-inkmuted">{new Date(t.at).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-ink/10">
              <h4 className="font-heading font-semibold mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Items</h4>
              {order.items.map((it, i) => (
                <div key={i} className="flex gap-3 py-2 text-sm">
                  <img src={it.image} className="w-14 h-14 rounded-xl object-cover" alt="" />
                  <div className="flex-1"><p className="font-medium">{it.name}</p><p className="text-inkmuted text-xs">Qty {it.quantity} · ₹{it.subtotal}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
