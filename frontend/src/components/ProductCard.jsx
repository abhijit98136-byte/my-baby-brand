import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useApp } from "../lib/store";
import { INR } from "../lib/api";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const inWish = wishlist.some((w) => w.id === product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="prod-card group fade-up-on-load" style={{ animationDelay: `${index * 60}ms` }} data-testid={`product-card-${product.slug}`}>
      <div className="relative overflow-hidden rounded-3xl bg-white aspect-[4/5] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <Link to={`/product/${product.slug}`}>
          <img src={product.images?.[0]} alt={product.name} loading="lazy" className="prod-img w-full h-full object-cover" />
        </Link>
        {discount > 0 && <div className="absolute top-3 left-3 chip bg-ink text-cream">{discount}% OFF</div>}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition ${inWish ? 'bg-pastelpink' : 'bg-white/80'}`}
          data-testid={`wishlist-btn-${product.slug}`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWish ? 'fill-ink' : ''}`} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center shadow-lg"
          data-testid={`quick-add-${product.slug}`}
          aria-label="Quick add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
        {product.stock < 10 && product.stock > 0 && <div className="absolute bottom-3 left-3 chip bg-lavender text-ink">Only {product.stock} left</div>}
        {product.stock === 0 && <div className="absolute bottom-3 left-3 chip bg-white text-ink">Out of stock</div>}
      </div>
      <div className="pt-4 px-1">
        <div className="flex items-center gap-1 text-xs text-inkmuted mb-1">
          <Star className="w-3 h-3 fill-ink text-ink" />
          <span className="font-medium text-ink">{product.rating}</span>
          <span>· {product.reviews_count} reviews</span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-heading font-medium text-base text-ink leading-snug line-clamp-2 hover:underline">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading font-semibold text-lg text-ink">{INR(product.price)}</span>
          {product.mrp > product.price && <span className="text-sm text-inkmuted line-through">{INR(product.mrp)}</span>}
        </div>
      </div>
    </div>
  );
}
