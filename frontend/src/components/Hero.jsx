import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden" data-testid="hero-section">
      <div className="blob w-[420px] h-[420px] bg-pastelpink/70 -top-10 -left-20"></div>
      <div className="blob w-[380px] h-[380px] bg-babyblue/70 top-20 right-0"></div>
      <div className="blob w-[300px] h-[300px] bg-mintgreen/60 bottom-0 left-1/3"></div>
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 grid lg:grid-cols-12 gap-12 items-center relative">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }} className="lg:col-span-7">
          <div className="chip bg-white/70 backdrop-blur mb-6 border border-white/80">
            <Sparkles className="w-4 h-4 text-pastelpink" />
            <span className="text-ink">India's most loved baby brand</span>
          </div>
          <h1 className="font-heading font-medium text-[2.6rem] md:text-6xl lg:text-[4.4rem] leading-[1.05] tracking-tight text-ink">
            Every smile begins with
            <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff8fbf] via-[#b88ee0] to-[#7ab9e8]">Pehli Kilkari</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-inkmuted max-w-xl leading-relaxed">
            <span className="font-heading italic text-[#5A2CA0] font-medium">Nanhe Kadmon Ke Bade Sapne</span> — Premium baby & kids essentials for your little one. Lovingly curated, baby-safe certified, and shipped across India.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-pill btn-primary" data-testid="hero-shop-now">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop?collection=newborn-essentials" className="btn-pill btn-secondary" data-testid="hero-explore">
              Explore Collections
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-inkmuted">
            <div><span className="font-heading font-semibold text-ink text-2xl">50K+</span><br/>Happy families</div>
            <div className="w-px h-10 bg-ink/15"></div>
            <div><span className="font-heading font-semibold text-ink text-2xl">4.9★</span><br/>Average rating</div>
            <div className="w-px h-10 bg-ink/15"></div>
            <div><span className="font-heading font-semibold text-ink text-2xl">100%</span><br/>Baby-safe</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.2 }} className="lg:col-span-5 relative h-[380px] sm:h-[480px] lg:h-[560px] scene hidden sm:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="giftbox">
              <div className="giftbox-face"></div>
              <div className="giftbox-ribbon-h"></div>
              <div className="giftbox-ribbon-v"></div>
              <div className="giftbox-lid"></div>
              <div className="giftbox-bow"></div>
            </div>
          </div>
          {/* Floating product chips */}
          <motion.div className="absolute top-6 right-6 glass-card rounded-2xl p-3 flex items-center gap-3 float-card" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <img src="https://images.pexels.com/photos/18112837/pexels-photo-18112837.jpeg" className="w-12 h-12 rounded-xl object-cover" alt="cap" />
            <div>
              <p className="text-xs font-semibold">Bunny Bonnet</p>
              <p className="text-xs text-inkmuted">₹449</p>
            </div>
          </motion.div>
          <motion.div className="absolute bottom-12 left-2 glass-card rounded-2xl p-3 flex items-center gap-3 float-card delay-1" animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }}>
            <img src="https://images.pexels.com/photos/32046405/pexels-photo-32046405.jpeg" className="w-12 h-12 rounded-xl object-cover" alt="set" />
            <div>
              <p className="text-xs font-semibold">Cloud Gift Set</p>
              <p className="text-xs text-inkmuted">₹1,799</p>
            </div>
          </motion.div>
          <motion.div className="absolute top-1/3 -left-4 glass-card rounded-2xl px-3 py-2 float-card delay-2" animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}>
            <p className="text-xs font-semibold">⭐ 4.9 / 5</p>
            <p className="text-[10px] text-inkmuted">12k+ reviews</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
