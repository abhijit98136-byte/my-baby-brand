import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useApp } from "../lib/store";
import { toast } from "sonner";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useApp();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) { nav("/auth"); return; }
    const sid = match[1];
    (async () => {
      try {
        const { data } = await api.post("/auth/google/session", {}, {
          headers: { "X-Session-ID": sid },
          withCredentials: true,
        });
        // We also keep a bearer token strategy so JWT flows still work.
        // For Google flow, cookie is set httpOnly. Store minimal user.
        setUser(data.user);
        // Also store the session_token as pk_token so protected API calls include Authorization header.
        if (data.session_token) localStorage.setItem("pk_token", data.session_token);
        toast.success(`Welcome, ${data.user.name}!`);
        window.history.replaceState({}, "", "/account");
        nav("/account", { replace: true });
      } catch (e) {
        toast.error("Google sign-in failed");
        nav("/auth");
      }
    })();
  }, []);

  return (
    <div className="pt-40 text-center min-h-screen">
      <div className="animate-pulse text-inkmuted">Signing you in…</div>
    </div>
  );
}
