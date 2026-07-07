import { Shield, Heart, Truck, Lock, Undo2 } from "lucide-react";

const items = [
  { icon: Shield, label: "100% Quality Checked", desc: "OEKO-TEX certified materials", bg: "bg-babyblue" },
  { icon: Heart, label: "Safe for Babies", desc: "Hypoallergenic & pediatrician approved", bg: "bg-pastelpink" },
  { icon: Truck, label: "Fast Shipping", desc: "Delivered in 2-5 business days", bg: "bg-mintgreen" },
  { icon: Lock, label: "Secure Payments", desc: "100% safe & encrypted checkout", bg: "bg-lavender" },
  { icon: Undo2, label: "Easy Returns", desc: "7-day no questions asked", bg: "bg-babyblue" },
];

export default function TrustBadges() {
  return (
    <section className="py-16 md:py-24" data-testid="trust-section">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {items.map((it) => (
            <div key={it.label} className="glass-card rounded-3xl p-5 text-center hover:-translate-y-1 transition" data-testid={`trust-${it.label}`}>
              <div className={`w-14 h-14 rounded-2xl ${it.bg} flex items-center justify-center mx-auto mb-3`}>
                <it.icon className="w-6 h-6 text-ink" />
              </div>
              <p className="font-heading font-semibold text-sm md:text-base text-ink">{it.label}</p>
              <p className="text-xs text-inkmuted mt-1">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
