import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { api, INR } from "../lib/api";
import { toast } from "sonner";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Plus } from "lucide-react";

export default function Admin() {
  const { user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    if (!user) { nav("/auth"); return; }
    if (user.role !== 'admin') { nav("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    try {
      const [s, p, o, u, c] = await Promise.all([
        api.get("/admin/stats"), api.get("/products?limit=200"),
        api.get("/admin/orders"), api.get("/admin/users"), api.get("/admin/coupons"),
      ]);
      setStats(s.data); setProducts(p.data); setOrders(o.data); setUsers(u.data); setCoupons(c.data);
    } catch { toast.error("Failed to load admin data"); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream" data-testid="admin-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <h1 className="font-heading text-4xl font-medium">Admin Dashboard</h1>
        <div className="grid lg:grid-cols-5 gap-6 mt-8">
          <aside className="glass-card rounded-3xl p-3 h-fit space-y-1">
            {[['dashboard','Dashboard',LayoutDashboard],['products','Products',Package],['orders','Orders',ShoppingBag],['users','Customers',Users],['coupons','Coupons',Tag]].map(([k,l,Ic])=>(
              <button key={k} onClick={()=>setTab(k)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-medium text-sm ${tab===k?'bg-ink text-cream':'hover:bg-white/70'}`} data-testid={`admin-tab-${k}`}><Ic className="w-4 h-4" /> {l}</button>
            ))}
          </aside>
          <div className="lg:col-span-4 space-y-6">
            {tab === "dashboard" && stats && (
              <>
                <div className="grid md:grid-cols-4 gap-4" data-testid="admin-stats">
                  {[['Total Sales',INR(stats.total_sales)],['Orders',stats.orders_count],['Customers',stats.users_count],['Products',stats.products_count]].map(([l,v],i) => (
                    <div key={i} className="glass-card rounded-3xl p-5">
                      <p className="text-xs text-inkmuted uppercase tracking-wider">{l}</p>
                      <p className="font-heading text-3xl font-semibold mt-2">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-3xl p-6">
                  <h3 className="font-heading text-xl font-semibold mb-4">Recent Orders</h3>
                  {stats.recent_orders.length === 0 ? <p className="text-inkmuted text-sm">No orders yet.</p>
                  : <table className="w-full text-sm"><thead><tr className="text-left text-inkmuted"><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                      <tbody>{stats.recent_orders.map(o=>(<tr key={o.id} className="border-t border-ink/5"><td className="py-2 font-medium">{o.order_number}</td><td>{o.address?.full_name}</td><td>{INR(o.total)}</td><td><span className="chip bg-mintgreen text-xs">{o.status}</span></td></tr>))}</tbody></table>}
                </div>
              </>
            )}
            {tab === "products" && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="font-heading text-xl font-semibold">Products ({products.length})</h3><AddProductButton onAdded={load} /></div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-inkmuted"><th className="py-2">Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
                  <tbody>{products.map(p=>(<tr key={p.id} className="border-t border-ink/5"><td className="py-2 font-medium flex items-center gap-2"><img src={p.images[0]} className="w-8 h-8 rounded-lg object-cover" alt="" />{p.name}</td><td>{p.category}</td><td>{INR(p.price)}</td><td>{p.stock}</td></tr>))}</tbody></table></div>
              </div>
            )}
            {tab === "orders" && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-heading text-xl font-semibold mb-4">All Orders ({orders.length})</h3>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-inkmuted"><th className="py-2">Order#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>{orders.map(o=>(<tr key={o.id} className="border-t border-ink/5"><td className="py-2 font-medium">{o.order_number}</td><td>{o.address?.full_name}</td><td>{o.items.length}</td><td>{INR(o.total)}</td><td><span className="chip bg-lavender text-xs">{o.status}</span></td></tr>))}</tbody></table></div>
              </div>
            )}
            {tab === "users" && (
              <div className="glass-card rounded-3xl p-6"><h3 className="font-heading text-xl font-semibold mb-4">Customers ({users.length})</h3>
                <table className="w-full text-sm"><thead><tr className="text-left text-inkmuted"><th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead>
                <tbody>{users.map(u=>(<tr key={u.id} className="border-t border-ink/5"><td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.phone||'-'}</td><td><span className="chip bg-babyblue text-xs">{u.role}</span></td></tr>))}</tbody></table>
              </div>
            )}
            {tab === "coupons" && (
              <div className="glass-card rounded-3xl p-6"><div className="flex justify-between items-center mb-4"><h3 className="font-heading text-xl font-semibold">Coupons</h3><AddCouponButton onAdded={load} /></div>
                <div className="space-y-2">{coupons.map(c=>(<div key={c.id} className="p-4 bg-white rounded-2xl flex justify-between"><div><p className="font-heading font-semibold">{c.code}</p><p className="text-xs text-inkmuted">{c.discount_pct}% off · Min order {INR(c.min_order)}</p></div><span className={`chip ${c.active?'bg-mintgreen':'bg-pastelpink'} text-xs`}>{c.active?'Active':'Inactive'}</span></div>))}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProductButton({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name:"", slug:"", description:"", price:0, mrp:0, category:"baby-gift-sets", images:"", stock:50, collection:"newborn-essentials", featured:false });
  const save = async () => {
    try { await api.post("/admin/products", { ...f, price:Number(f.price), mrp:Number(f.mrp), stock:Number(f.stock), images: f.images.split(",").map(s=>s.trim()) });
      toast.success("Product added"); setOpen(false); onAdded(); }
    catch { toast.error("Failed"); }
  };
  return open ? (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur flex items-center justify-center p-4" onClick={()=>setOpen(false)}>
      <div className="bg-cream rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <h3 className="font-heading text-xl font-semibold mb-4">Add Product</h3>
        <div className="space-y-2">
          {[['name','Name'],['slug','Slug'],['description','Description'],['category','Category slug'],['collection','Collection slug'],['images','Image URLs (comma separated)']].map(([k,l])=>(
            <input key={k} placeholder={l} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} className="w-full px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" />
          ))}
          <div className="grid grid-cols-3 gap-2">
            {[['price','Price'],['mrp','MRP'],['stock','Stock']].map(([k,l])=>(
              <input key={k} type="number" placeholder={l} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} className="w-full px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" />
            ))}
          </div>
          <button onClick={save} className="btn-pill btn-primary w-full justify-center mt-2">Save Product</button>
        </div>
      </div>
    </div>
  ) : <button onClick={()=>setOpen(true)} className="btn-pill btn-primary text-sm !py-2 !px-4" data-testid="add-product-btn"><Plus className="w-4 h-4" /> Add</button>;
}

function AddCouponButton({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code:"", discount_pct:10, min_order:0, active:true });
  const save = async () => {
    try { await api.post("/admin/coupons", { ...f, discount_pct:Number(f.discount_pct), min_order:Number(f.min_order) });
      toast.success("Coupon added"); setOpen(false); onAdded(); }
    catch { toast.error("Failed"); }
  };
  return open ? (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur flex items-center justify-center p-4" onClick={()=>setOpen(false)}>
      <div className="bg-cream rounded-3xl p-6 max-w-md w-full" onClick={e=>e.stopPropagation()}>
        <h3 className="font-heading text-xl font-semibold mb-4">Add Coupon</h3>
        <div className="space-y-2">
          <input placeholder="Code" value={f.code} onChange={e=>setF({...f,code:e.target.value})} className="w-full px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" />
          <input type="number" placeholder="Discount %" value={f.discount_pct} onChange={e=>setF({...f,discount_pct:e.target.value})} className="w-full px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" />
          <input type="number" placeholder="Min order" value={f.min_order} onChange={e=>setF({...f,min_order:e.target.value})} className="w-full px-4 py-2.5 rounded-full bg-white border border-ink/10 text-sm" />
          <button onClick={save} className="btn-pill btn-primary w-full justify-center mt-2">Save Coupon</button>
        </div>
      </div>
    </div>
  ) : <button onClick={()=>setOpen(true)} className="btn-pill btn-primary text-sm !py-2 !px-4"><Plus className="w-4 h-4" /> Add</button>;
}
