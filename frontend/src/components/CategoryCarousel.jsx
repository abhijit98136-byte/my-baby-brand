import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

export default function CategoryCarousel({ categories }) {
  return (
    <section className="py-16 md:py-24" data-testid="categories-section">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="chip bg-lavender mb-3">Shop by Category</p>
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-ink leading-tight max-w-xl">Tiny essentials, big love</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex text-sm font-semibold text-ink underline underline-offset-4">View all →</Link>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map((c, i) => {
            const Icon = Icons[c.icon] || Icons.Gift;
            return (
              <Link key={c.slug} to={`/shop?category=${c.slug}`} className="shrink-0 group" data-testid={`category-${c.slug}`}>
                <div className="w-[170px] md:w-[200px]">
                  <div className="rounded-3xl aspect-square flex items-center justify-center transition group-hover:-translate-y-1.5 group-hover:shadow-lg" style={{ background: c.color }}>
                    <Icon className="w-12 h-12 md:w-14 md:h-14 text-ink" strokeWidth={1.5} />
                  </div>
                  <p className="mt-3 text-center font-heading font-medium text-ink">{c.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
