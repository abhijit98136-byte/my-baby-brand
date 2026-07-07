import StaticPage from "./StaticPage";
import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function About() {
  return (
    <StaticPage title="Our story">
      <p><b>Pehli Kilkari</b> means "first coo" — that magical first sound your little one makes that fills the whole home with joy. We started with a simple mission: to bring premium, safe, and beautifully-designed essentials for India's newest generation of tiny humans.</p>
      <p>Every product goes through 27 quality checks. Every fabric is OEKO-TEX certified. Every design is pediatrician-approved. Because your baby's first everything deserves nothing less.</p>
      <img src="https://images.pexels.com/photos/16145651/pexels-photo-16145651.jpeg" className="w-full rounded-3xl mt-6" alt="Nursery" />
      <h3 className="font-heading text-2xl text-ink mt-8">Our promise</h3>
      <p>Baby-safe materials. Global design language. Made-for-India sizing. And 24×7 parent support because we know parenting isn't 9-to-5.</p>
    </StaticPage>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/contact", form); toast.success("Message sent! We'll get back within 24h."); setForm({name:"",email:"",message:""}); }
    catch { toast.error("Could not send"); }
  };
  return (
    <div className="pt-28 pb-20 min-h-screen" data-testid="contact-page">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">Say hello</h1>
        <p className="text-inkmuted mt-3">We reply to every message — usually within a few hours.</p>
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <form onSubmit={submit} className="glass-card rounded-3xl p-6 space-y-3">
            <input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="contact-name" />
            <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="contact-email" />
            <textarea required rows="5" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="w-full px-4 py-3 rounded-3xl bg-white border border-ink/10" data-testid="contact-message"></textarea>
            <button className="btn-pill btn-primary w-full justify-center" data-testid="contact-submit">Send Message</button>
          </form>
          <div className="space-y-3">
            {[[Mail,'care@pehlikilkari.com'],[Phone,'+91 99999 99999'],[MessageCircle,'WhatsApp us anytime'],[MapPin,'Mumbai, India']].map(([Ic,t],i)=>(
              <div key={i} className="glass-card rounded-3xl p-5 flex items-center gap-4"><div className="w-11 h-11 rounded-full bg-pastelpink flex items-center justify-center"><Ic className="w-5 h-5" /></div><p className="font-medium">{t}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  ["Are your products safe for newborns?","Absolutely. Every product is OEKO-TEX certified, hypoallergenic, and pediatrician-approved. We use only baby-safe dyes and materials."],
  ["What is your return policy?","We offer 7-day easy returns on all unused items in original packaging. Just raise a request from your account."],
  ["How long does shipping take?","We ship pan-India in 2-5 business days. Metro cities usually receive within 48 hours."],
  ["Do you offer Cash on Delivery?","Yes, COD is available for orders below ₹5,000 across most pincodes."],
  ["Can I track my order?","Yes, you'll get real-time tracking updates on WhatsApp and email. You can also track via our Track Order page."],
  ["Do you gift-wrap orders?","Every order is beautifully packed in our signature pastel gift box, free of charge."],
];

export function FAQ() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl md:text-5xl font-medium">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="mt-8" data-testid="faq-accordion">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-ink/10">
              <AccordionTrigger className="text-left font-heading font-medium text-lg hover:no-underline py-5">{f[0]}</AccordionTrigger>
              <AccordionContent className="text-inkmuted leading-relaxed pb-5">{f[1]}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export function Privacy() { return <StaticPage title="Privacy Policy"><p>Your privacy matters. We collect only what's needed to serve you well — name, email, phone, address for orders. We never sell your data. We use industry-standard encryption for payments and communications.</p><p>You can request deletion of your account and data anytime by writing to care@pehlikilkari.com.</p></StaticPage>; }
export function Returns() { return <StaticPage title="Return Policy"><p>7-day no-questions-asked returns on all unused items in original packaging. Hygiene products (wipes, opened skincare) are non-returnable. Refunds are processed to the original payment mode within 5-7 business days.</p></StaticPage>; }
export function Terms() { return <StaticPage title="Terms & Conditions"><p>By using this website, you agree to abide by our terms including product usage as intended, no reselling of promotional offers, and respectful communication. All disputes are subject to Mumbai jurisdiction.</p></StaticPage>; }
