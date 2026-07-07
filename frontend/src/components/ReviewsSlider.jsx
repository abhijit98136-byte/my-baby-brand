import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Star } from "lucide-react";

const fallback = [
  { user_name: "Aisha M.", rating: 5, comment: "Absolutely love the quality! My baby's skin is so sensitive but no issues at all." },
  { user_name: "Priya S.", rating: 5, comment: "Premium packaging, soft fabrics. Will buy again!" },
  { user_name: "Rohan K.", rating: 4, comment: "Got the gift set for my niece. Family loved it!" },
  { user_name: "Neha P.", rating: 5, comment: "Best baby brand I've found in India. Carter's level quality." },
];

const avatars = [
  "https://images.pexels.com/photos/32046405/pexels-photo-32046405.jpeg",
  "https://images.pexels.com/photos/18112837/pexels-photo-18112837.jpeg",
  "https://images.pexels.com/photos/36039/baby-twins-brother-and-sister-one-hundred-days.jpg",
  "https://images.pexels.com/photos/16145651/pexels-photo-16145651.jpeg",
];

export default function ReviewsSlider() {
  const [reviews, setReviews] = useState(fallback);
  useEffect(() => {
    api.get("/reviews?product_id=homepage").then(r => { if (r.data?.length) setReviews(r.data); }).catch(()=>{});
  }, []);
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-cream to-lavender/30" data-testid="reviews-section">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-12">
          <p className="chip bg-white/70 mb-4 mx-auto">Loved by parents</p>
          <h2 className="font-heading text-3xl md:text-5xl font-medium text-ink">Real smiles from real families</h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-6 marquee-track w-max">
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="w-[320px] md:w-[380px] glass-card rounded-3xl p-6 shrink-0" data-testid={`review-card-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <img src={avatars[i % avatars.length]} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-heading font-semibold text-ink">{r.user_name}</p>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-ink text-ink" />)}</div>
                  </div>
                </div>
                <p className="text-sm text-inkmuted leading-relaxed">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
