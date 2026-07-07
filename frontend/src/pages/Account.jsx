import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../lib/store";
import { api, INR } from "../lib/api";
import { Package, MapPin, Heart, Clock } from "lucide-react";

export default function Account() {
  const { user, wishlist, recentlyViewed } = useApp();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const nav = useNavigate();

  useEffect(() => {
    if (!user) { nav("/auth"); return; }
    api.get("/orders").then(r => setOrders(r.data));
  }, [user]);

  if (!user) return null;

  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="account-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">Hi, {user.name} 👋</h1>
        <div className="grid lg:grid-cols-4 gap-6 mt-10">
          <aside className="glass-card rounded-3xl p-4 h-fit">
            {[['orders','My Orders',Package],['wishlist','Wishlist',Heart],['recent','Recently Viewed',Clock]].map(([k,l,Ic])=>(
              <button key={k} onClick={()=>setTab(k)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-medium text-sm ${tab===k?'bg-cream':''}`} data-testid={`tab-${k}`}><Ic className="w-4 h-4" /> {l}</button>
            ))}
          </aside>
          <div className="lg:col-span-3 space-y-4">
            {tab === "orders" && (
              orders.length === 0 ? <div className="glass-card rounded-3xl p-8 text-center text-inkmuted">No orders yet. <Link to="/shop" className="text-ink underline">Start shopping</Link></div>
              : orders.map(o => (
                <div key={o.id} className="glass-card rounded-3xl p-5" data-testid={`order-${o.order_number}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-inkmuted">{new Date(o.created_at).toLocaleDateString()}</p>
                      <p className="font-heading font-semibold">{o.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-inkmuted">{o.items.length} items · {o.status}</p>
                      <p className="font-heading font-semibold">{INR(o.total)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {o.items.slice(0,4).map((it,i) => <img key={i} src={it.image} className="w-14 h-14 rounded-xl object-cover" alt="" />)}
                  </div>
                  <Link to={`/track/${o.order_number}`} className="text-sm font-semibold underline mt-3 inline-block">Track order →</Link>
                </div>
              ))
            )}
            {tab === "wishlist" && (
              wishlist.length === 0 ? <div className="glass-card rounded-3xl p-8 text-center text-inkmuted">Your wishlist is empty.</div>
              : <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map(w => (
                  <Link key={w.id} to={`/product/${w.slug}`} className="glass-card rounded-3xl overflow-hidden">
                    <img src={w.image} className="w-full aspect-square object-cover" alt="" />
                    <div className="p-3"><p className="font-medium text-sm line-clamp-1">{w.name}</p><p className="font-semibold text-sm mt-1">{INR(w.price)}</p></div>
                  </Link>
                ))}
              </div>
            )}
            {tab === "recent" && (
              recentlyViewed.length === 0 ? <div className="glass-card rounded-3xl p-8 text-center text-inkmuted">Nothing here yet.</div>
              : <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recentlyViewed.map(w => (
                  <Link key={w.id} to={`/product/${w.slug}`} className="glass-card rounded-3xl overflow-hidden">
                    <img src={w.image} className="w-full aspect-square object-cover" alt="" />
                    <div className="p-3"><p className="font-medium text-sm line-clamp-1">{w.name}</p><p className="font-semibold text-sm mt-1">{INR(w.price)}</p></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
