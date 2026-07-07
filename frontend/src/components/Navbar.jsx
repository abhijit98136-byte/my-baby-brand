import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { ShoppingBag, Heart, User, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { cart, wishlist, user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass" data-testid="navbar">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16 flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5" data-testid="logo-link">
          <img src="https://customer-assets.emergentagent.com/job_kidz-essentials-3d/artifacts/ayqqjhp1_Pehli-Kilkari-Main-Logo.jpg" alt="Pehli Kilkari" className="w-11 h-11 rounded-full object-cover shadow-sm bg-white" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-heading font-bold text-lg text-[#5A2CA0]">Pehli Kilkari</span>
            <span className="text-[10px] text-inkmuted -mt-0.5">Nanhe Kadmon Ke Bade Sapne</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-ink">
          <Link to="/" className="hover:opacity-60 transition" data-testid="nav-home">Home</Link>
          <Link to="/shop" className="hover:opacity-60 transition" data-testid="nav-shop">Shop</Link>
          <Link to="/shop?collection=newborn-essentials" className="hover:opacity-60 transition" data-testid="nav-collections">Collections</Link>
          <Link to="/track" className="hover:opacity-60 transition" data-testid="nav-track">Track Order</Link>
          <Link to="/about" className="hover:opacity-60 transition" data-testid="nav-about">About</Link>
          <Link to="/contact" className="hover:opacity-60 transition" data-testid="nav-contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <form onSubmit={(e) => { e.preventDefault(); if(q) nav(`/shop?q=${encodeURIComponent(q)}`); }} className="hidden md:flex items-center bg-white/70 rounded-full px-3 py-2 border border-white/80 w-56">
            <Search className="w-4 h-4 text-inkmuted" />
            <input data-testid="search-input" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search products" className="bg-transparent outline-none text-sm ml-2 w-full" />
          </form>
          <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-white/60 transition" data-testid="wishlist-icon">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-pastelpink text-ink text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-white/60 transition" data-testid="cart-icon">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-ink text-cream text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold" data-testid="cart-count">{totalItems}</span>}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to={user.role === 'admin' ? '/admin' : '/account'} className="p-2 rounded-full hover:bg-white/60" data-testid="account-icon"><User className="w-5 h-5" /></Link>
              <button onClick={logout} className="text-xs text-inkmuted hover:text-ink" data-testid="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex btn-pill btn-primary text-sm !py-2 !px-5" data-testid="login-link">Sign In</Link>
          )}
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/60 bg-cream/95 backdrop-blur px-6 py-4 flex flex-col gap-3" data-testid="mobile-menu">
          {['/','/shop','/track','/about','/contact'].map((p,i)=>(
            <Link key={p} to={p} onClick={()=>setOpen(false)} className="py-2 font-medium">
              {['Home','Shop','Track Order','About','Contact'][i]}
            </Link>
          ))}
          {!user && <Link to="/auth" onClick={()=>setOpen(false)} className="btn-pill btn-primary text-sm mt-2">Sign In</Link>}
        </div>
      )}
    </header>
  );
}
