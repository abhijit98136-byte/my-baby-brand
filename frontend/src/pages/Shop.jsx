import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") || "";
  const collection = params.get("collection") || "";
  const q = params.get("q") || "";

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data));
    api.get("/collections").then(r => setCollections(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (collection) qs.set("collection", collection);
    if (q) qs.set("q", q);
    api.get(`/products?${qs.toString()}`).then(r => { setProducts(r.data); setLoading(false); });
  }, [category, collection, q]);

  const setFilter = (key, val) => {
    const np = new URLSearchParams(params);
    if (val) np.set(key, val); else np.delete(key);
    if (key === "category") np.delete("collection");
    if (key === "collection") np.delete("category");
    setParams(np);
  };

  return (
    <div className="pt-28 pb-20" data-testid="shop-page">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-medium text-ink">Shop all</h1>
          <p className="text-inkmuted mt-2">{products.length} premium products for little ones</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6" data-testid="shop-filters">
            <div className="glass-card rounded-3xl p-5">
              <h4 className="font-heading font-semibold mb-3">Categories</h4>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setFilter("category", "")} className={`text-left text-sm py-1.5 ${!category ? 'font-bold' : 'text-inkmuted'}`}>All Products</button>
                {categories.map(c => (
                  <button key={c.slug} onClick={() => setFilter("category", c.slug)} className={`text-left text-sm py-1.5 ${category === c.slug ? 'font-bold' : 'text-inkmuted hover:text-ink'}`} data-testid={`filter-cat-${c.slug}`}>{c.name}</button>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-5">
              <h4 className="font-heading font-semibold mb-3">Collections</h4>
              <div className="flex flex-col gap-1.5">
                {collections.map(c => (
                  <button key={c.slug} onClick={() => setFilter("collection", c.slug)} className={`text-left text-sm py-1.5 ${collection === c.slug ? 'font-bold' : 'text-inkmuted hover:text-ink'}`}>{c.name}</button>
                ))}
              </div>
            </div>
          </aside>
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length:6}).map((_,i)=><div key={i} className="bg-white/60 rounded-3xl aspect-[4/5] animate-pulse"></div>)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-inkmuted">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
