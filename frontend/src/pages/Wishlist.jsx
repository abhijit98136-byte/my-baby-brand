import { Link } from "react-router-dom";
import { useApp } from "../lib/store";
import { INR } from "../lib/api";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useApp();
  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="wishlist-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">Your Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-20 text-inkmuted">Save your favourite little things here. <Link to="/shop" className="text-ink underline ml-1">Browse products</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {wishlist.map(w => (
              <div key={w.id} className="glass-card rounded-3xl overflow-hidden relative">
                <Link to={`/product/${w.slug}`}><img src={w.image} className="w-full aspect-square object-cover" alt="" /></Link>
                <button onClick={() => toggleWishlist(w)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-pastelpink flex items-center justify-center"><Heart className="w-4 h-4 fill-ink" /></button>
                <div className="p-4"><p className="font-medium line-clamp-1">{w.name}</p><p className="font-heading font-semibold mt-1">{INR(w.price)}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
