import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "../lib/api";

const GREETING = "Welcome to Pehli Kilkari! How can I help you and your little one today? 💜";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [messages, open]);
  useEffect(() => { const t = setTimeout(() => setTeaser(false), 10000); return () => clearTimeout(t); }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput(""); setSending(true);
    setMessages(m => [...m, { role: "user", text }]);
    try {
      const { data } = await api.post("/chat", { message: text, session_id: sessionId });
      if (!sessionId) setSessionId(data.session_id);
      setMessages(m => [...m, { role: "bot", text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Oops, I couldn't reach the server. Please try again or contact us at pehlikilkari@gmail.com." }]);
    } finally { setSending(false); }
  };

  const quick = ["Show me gift sets", "What's the return policy?", "Any coupons today?"];

  return (
    <>
      {!open && teaser && (
        <div className="fixed bottom-24 right-6 z-40 max-w-[240px] glass-card rounded-2xl px-4 py-3 shadow-lg animate-bounce" data-testid="chatbot-teaser">
          <p className="text-xs text-ink leading-snug">👋 Hi! Need help finding the perfect gift? Chat with Kilkari.</p>
        </div>
      )}
      <button
        onClick={() => { setOpen(!open); setTeaser(false); }}
        aria-label="Open chat"
        data-testid="chatbot-toggle"
        className="fixed bottom-6 right-24 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-pastelpink via-lavender to-babyblue text-ink flex items-center justify-center shadow-lg hover:scale-110 transition border-2 border-white"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-24 z-40 w-[92vw] max-w-[380px] h-[520px] rounded-3xl bg-cream shadow-2xl flex flex-col overflow-hidden border border-white" data-testid="chatbot-panel">
          <div className="p-4 bg-gradient-to-br from-pastelpink via-lavender to-babyblue flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><Sparkles className="w-5 h-5 text-[#5A2CA0]" /></div>
            <div className="flex-1">
              <p className="font-heading font-bold text-ink leading-none">Kilkari</p>
              <p className="text-[11px] text-ink/70 mt-0.5">Your baby-shopping bestie · online</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/40 rounded-full"><X className="w-4 h-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 text-sm rounded-2xl ${m.role === "user" ? "bg-ink text-cream rounded-br-md" : "bg-white text-ink rounded-bl-md border border-ink/5"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-white px-3.5 py-2.5 rounded-2xl border border-ink/5"><div className="flex gap-1"><span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div></div></div>}
          </div>
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {quick.map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(send, 50); }} className="text-[11px] chip bg-lavender text-ink hover:bg-pastelpink transition" data-testid={`quick-${q.slice(0,10)}`}>{q}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e)=>{e.preventDefault();send();}} className="p-3 border-t border-ink/5 bg-white flex gap-2 items-center">
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={sending}
              data-testid="chatbot-input"
              className="flex-1 px-4 py-2.5 rounded-full bg-cream border border-ink/10 text-sm outline-none focus:border-[#5A2CA0]"
            />
            <button type="submit" disabled={sending || !input.trim()} data-testid="chatbot-send" className="w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
