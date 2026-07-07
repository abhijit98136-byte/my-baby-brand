import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, INR } from "../lib/api";
import { useApp } from "../lib/store";
import { Heart, ShoppingBag, Shield, Truck, Undo2, Star, Minus, Plus } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { addToCart, toggleWishlist, wishlist, addRecentlyViewed } = useApp();

  useEffect(() => {
    api.get(`/products/${slug}`).then(r => {
      setProduct(r.data); addRecentlyViewed(r.data);
      api.get(`/products?category=${r.data.category}`).then(rr => setRelated(rr.data.filter(p => p.slug !== slug).slice(0, 4)));
    });
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!product) return <div className="pt-32 text-center">Loading...</div>;
  const inWish = wishlist.some(w => w.id === product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="pt-28 pb-20" data-testid="product-detail-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <nav className="text-sm text-inkmuted mb-6"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span className="text-ink">{product.name}</span></nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white">
              <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && <div className="absolute top-4 left-4 chip bg-ink text-cream">{discount}% OFF</div>}
            </div>
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${imgIdx === i ? 'border-ink' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-ink text-ink" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-inkmuted">· {product.reviews_count} reviews</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-medium text-ink mt-3 leading-tight">{product.name}</h1>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-heading text-3xl font-semibold text-ink" data-testid="product-price">{INR(product.price)}</span>
              {product.mrp > product.price && <span className="text-lg text-inkmuted line-through">{INR(product.mrp)}</span>}
              {discount > 0 && <span className="chip bg-mintgreen text-ink">Save {discount}%</span>}
            </div>
            <p className="text-inkmuted mt-5 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity:</span>
              <div className="flex items-center bg-white/70 border border-ink/10 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5" data-testid="qty-minus"><Minus className="w-3.5 h-3.5" /></button>
                <span className="w-10 text-center font-semibold" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2.5" data-testid="qty-plus"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <span className={`text-xs ${product.stock > 10 ? 'text-green-700' : 'text-orange-700'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={() => addToCart(product, qty)} className="btn-pill btn-primary flex-1 justify-center" data-testid="add-to-cart-btn">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={() => toggleWishlist(product)} className={`btn-pill ${inWish ? 'bg-pastelpink' : 'btn-secondary'}`} data-testid="add-wishlist-btn">
                <Heart className={`w-4 h-4 ${inWish ? 'fill-ink' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              {[{i:Shield,t:'Baby Safe'},{i:Truck,t:'Free Shipping ₹999+'},{i:Undo2,t:'Easy Returns'}].map((x,i) => (
                <div key={i} className="glass-card rounded-2xl p-4 text-center">
                  <x.i className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold">{x.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h3 className="font-heading text-2xl md:text-3xl font-medium mb-8">You may also love</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
