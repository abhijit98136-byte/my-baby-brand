import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = async (e) => {
    e.preventDefault();
    try { await api.post("/newsletter", { email }); toast.success("Subscribed! Welcome to the family 💕"); setEmail(""); }
    catch { toast.error("Could not subscribe"); }
  };
  return (
    <footer className="bg-gradient-to-br from-lavender/40 via-pastelpink/30 to-babyblue/40 mt-20 relative overflow-hidden" data-testid="footer">
      <div className="blob w-72 h-72 bg-pastelpink/60 -top-10 -left-10"></div>
      <div className="blob w-96 h-96 bg-babyblue/50 -bottom-20 -right-10"></div>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-10 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="https://customer-assets.emergentagent.com/job_kidz-essentials-3d/artifacts/ayqqjhp1_Pehli-Kilkari-Main-Logo.jpg" alt="Pehli Kilkari" className="w-12 h-12 rounded-full object-cover bg-white shadow-sm" />
              <div className="leading-tight">
                <div className="font-heading font-bold text-lg text-[#5A2CA0]">Pehli Kilkari</div>
                <div className="text-[10px] text-inkmuted">Nanhe Kadmon Ke Bade Sapne</div>
              </div>
            </div>
            <p className="text-sm text-inkmuted leading-relaxed">Every smile begins with Pehli Kilkari. Premium baby & kids essentials, lovingly curated for India's little ones.</p>
            <div className="flex gap-2 mt-5">
              <a href="https://instagram.com" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center hover:scale-110 transition" data-testid="social-instagram"><Instagram className="w-4 h-4" /></a>
              <a href="https://facebook.com" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center hover:scale-110 transition" data-testid="social-facebook"><Facebook className="w-4 h-4" /></a>
              <a href="https://youtube.com" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center hover:scale-110 transition" data-testid="social-youtube"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-inkmuted">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?collection=newborn-essentials">Newborn Essentials</Link></li>
              <li><Link to="/shop?collection=baby-care">Baby Care</Link></li>
              <li><Link to="/shop?collection=school-essentials">School Essentials</Link></li>
              <li><Link to="/shop?collection=creative-learning-kits">Creative Learning</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-inkmuted">
              <li><Link to="/track">Track Order</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Stay in the loop</h4>
            <p className="text-sm text-inkmuted mb-3">Be the first to know about new arrivals & exclusive offers.</p>
            <form onSubmit={subscribe} className="flex gap-2" data-testid="newsletter-form">
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" data-testid="newsletter-input" className="flex-1 px-4 py-3 rounded-full bg-white/80 outline-none text-sm border border-white" />
              <button data-testid="newsletter-submit" className="btn-pill btn-primary text-sm !py-3 !px-5"><Mail className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
        <div className="border-t border-ink/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-inkmuted">
          <p>© {new Date().getFullYear()} Pehli Kilkari. All rights reserved.</p>
          <p>Made with 💕 for little ones across India.</p>
        </div>
      </div>
      <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition" data-testid="whatsapp-button">
        <MessageCircle className="w-6 h-6" />
      </a>
    </footer>
  );
}
