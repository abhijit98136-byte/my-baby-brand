import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Hero from "../components/Hero";
import TrustBadges from "../components/TrustBadges";
import CategoryCarousel from "../components/CategoryCarousel";
import ProductCard from "../components/ProductCard";
import ReviewsSlider from "../components/ReviewsSlider";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then(r => setProducts(r.data));
    api.get("/categories").then(r => setCategories(r.data));
    api.get("/collections").then(r => setCollections(r.data));
  }, []);

  return (
    <div data-testid="home-page">
      <Hero />
      <CategoryCarousel categories={categories} />

      {/* Featured products */}
      <section className="py-20 md:py-28" data-testid="featured-products">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="chip bg-pastelpink mb-3">Bestsellers</p>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-ink leading-tight">Floating into hearts</h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-4">View all <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
            {products.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Collections bento */}
      <section className="py-20" data-testid="collections-section">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <p className="chip bg-mintgreen mb-3 mx-auto">Curated Collections</p>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-ink">A world made for tiny humans</h2>
          </div>
          <div className="grid md:grid-cols-12 gap-6">
            {collections.slice(0, 5).map((c, i) => (
              <Link key={c.slug} to={`/shop?collection=${c.slug}`} className={`relative overflow-hidden rounded-3xl group ${i === 0 ? 'md:col-span-7 aspect-[16/10]' : i === 1 ? 'md:col-span-5 aspect-[16/10]' : 'md:col-span-4 aspect-[4/3]'}`} data-testid={`collection-${c.slug}`}>
                <img src={c.image} alt={c.name} className="w-full h-full object-cover prod-img" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-cream">
                  <h3 className="font-heading text-2xl md:text-3xl font-medium">{c.name}</h3>
                  <p className="mt-1 text-sm opacity-90">Shop the collection →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />
      <ReviewsSlider />

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-pastelpink via-lavender to-babyblue p-12 md:p-20 text-center relative overflow-hidden">
            <div className="blob w-72 h-72 bg-white/50 -top-20 -left-10"></div>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-ink relative">Get 10% off your first order</h2>
            <p className="text-inkmuted mt-3 relative">Use code <span className="font-bold text-ink">WELCOME10</span> at checkout.</p>
            <Link to="/shop" className="btn-pill btn-primary mt-7 inline-flex relative" data-testid="cta-shop-now">Start Shopping <ArrowRight className="w-4 h-4"/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
