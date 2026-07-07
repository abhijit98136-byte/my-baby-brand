import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../lib/store";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const { login, signup, otpVerify } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const next = new URLSearchParams(loc.search).get("next") || "/";

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const u = await login(form.email, form.password);
        nav(u.role === 'admin' ? '/admin' : next);
      } else if (mode === "signup") {
        await signup(form); nav(next);
      } else if (mode === "otp") {
        if (!otpSent) {
          const { data } = await api.post("/auth/otp/request", { phone: form.phone });
          setOtpSent(true); setOtpHint(data.demo_otp);
          toast.info(`Demo OTP: ${data.demo_otp}`);
        } else {
          await otpVerify({ phone: form.phone, otp, name: form.name }); nav(next);
        }
      }
    } catch (err) { toast.error(err.response?.data?.detail || "Error"); }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center" data-testid="auth-page">
      <div className="max-w-md mx-auto w-full px-6">
        <div className="glass-card rounded-3xl p-8">
          <h1 className="font-heading text-3xl font-medium text-ink">{mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "OTP Login"}</h1>
          <p className="text-inkmuted text-sm mt-1">{mode === "login" ? "Sign in to continue shopping" : mode === "signup" ? "Join the Pehli Kilkari family" : "Quick login via mobile OTP"}</p>

          <div className="flex gap-2 mt-6 bg-cream rounded-full p-1">
            {["login","signup","otp"].map(m => (
              <button key={m} onClick={() => { setMode(m); setOtpSent(false); }} className={`flex-1 py-2 rounded-full text-sm font-semibold ${mode === m ? 'bg-ink text-cream' : 'text-inkmuted'}`} data-testid={`tab-${m}`}>
                {m === "otp" ? "OTP" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3 mt-6">
            {mode === "signup" && <input required placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="auth-name" />}
            {(mode === "login" || mode === "signup") && (
              <>
                <input type="email" required placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="auth-email" />
                <input type="password" required placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="auth-password" />
              </>
            )}
            {mode === "otp" && (
              <>
                <input required placeholder="Phone (10 digits)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} disabled={otpSent} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10 disabled:opacity-60" data-testid="auth-phone" />
                {otpSent && (
                  <>
                    {otpHint && <p className="text-xs text-inkmuted">Demo OTP: <b>{otpHint}</b></p>}
                    <input required placeholder="Enter 6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value)} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="auth-otp" />
                    <input placeholder="Your name (optional)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-3 rounded-full bg-white border border-ink/10" data-testid="auth-otp-name" />
                  </>
                )}
              </>
            )}
            <button type="submit" className="btn-pill btn-primary w-full justify-center" data-testid="auth-submit">
              {mode === "otp" ? (otpSent ? "Verify OTP" : "Send OTP") : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-inkmuted">
            <div className="flex-1 h-px bg-ink/10"></div>OR<div className="flex-1 h-px bg-ink/10"></div>
          </div>

          {/* REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH */}
          <button
            type="button"
            data-testid="google-signin-btn"
            onClick={() => {
              const redirectUrl = window.location.origin + "/auth/callback";
              window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
            }}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-white border border-ink/10 hover:bg-cream transition font-semibold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.3 5.3C41.4 35.5 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>

          {mode === "login" && <p className="text-xs text-inkmuted text-center mt-4">Admin: admin@pehlikilkari.com / Admin@123</p>}
          <Link to="/" className="block text-center text-sm text-inkmuted mt-4 hover:text-ink">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
