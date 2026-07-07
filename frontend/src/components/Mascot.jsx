import { useEffect, useState } from "react";

/**
 * Scroll-reactive sticky mascot "Kilki".
 * Uses inline SVG (baby face, brand purple) with 3 states that swap based on scroll depth:
 *  - "wave"       (top of page — hero)
 *  - "point"      (mid-page — products/collections, excited)
 *  - "sleep"      (near footer)
 * Bobs up-down continuously, gentle hover interaction.
 * Easy to swap SVG for Lottie later — just replace the <svg> blocks and keep the state machine.
 */
export default function Mascot() {
  const [state, setState] = useState("wave");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? y / h : 0;
      if (p < 0.15) setState("wave");
      else if (p < 0.85) setState("point");
      else setState("sleep");
      // hide on very small viewports when chatbot is open? we keep visible
      setHidden(window.innerWidth < 640 && p > 0.05 && p < 0.9 ? false : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const captions = {
    wave: "Hi there! 👋",
    point: "Check these out! 👇",
    sleep: "Shhh… napping 💤",
  };

  return (
    <div
      className={`fixed left-4 md:left-6 bottom-6 z-40 pointer-events-none select-none transition-opacity duration-500 ${hidden ? "opacity-0" : "opacity-100"}`}
      data-testid="mascot"
      aria-hidden="true"
    >
      <div className="relative animate-floatslow">
        {/* Caption bubble */}
        <div className="absolute -top-8 left-16 whitespace-nowrap chip glass-card text-[11px] font-semibold" data-testid={`mascot-caption-${state}`}>
          {captions[state]}
        </div>
        {/* Mascot SVG */}
        <svg width="88" height="88" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className={`drop-shadow-xl ${state === "point" ? "animate-bounce" : ""}`}>
          <defs>
            <radialGradient id="face" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#FFF6DC" />
              <stop offset="100%" stopColor="#FFE9B8" />
            </radialGradient>
          </defs>
          {/* Head */}
          <circle cx="60" cy="60" r="42" fill="url(#face)" stroke="#5A2CA0" strokeWidth="4" />
          {/* Ears */}
          <circle cx="18" cy="62" r="7" fill="url(#face)" stroke="#5A2CA0" strokeWidth="3" />
          <circle cx="102" cy="62" r="7" fill="url(#face)" stroke="#5A2CA0" strokeWidth="3" />
          {/* Curl (top) */}
          <path d="M55 22 Q58 12 68 18 Q65 26 55 26 Z" fill="#FFB6D6" stroke="#5A2CA0" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="38" cy="72" r="6" fill="#FFC7DC" opacity="0.85" />
          <circle cx="82" cy="72" r="6" fill="#FFC7DC" opacity="0.85" />

          {/* Eyes / expression per state */}
          {state === "wave" && (
            <>
              <path d="M40 60 Q46 54 52 60" stroke="#5A2CA0" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M68 60 Q74 54 80 60" stroke="#5A2CA0" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Smile */}
              <path d="M46 78 Q60 92 74 78 Q72 88 60 88 Q48 88 46 78 Z" fill="#7A2FA0" stroke="#5A2CA0" strokeWidth="2.5" />
              <path d="M52 84 Q60 88 68 84" fill="#FFB6D6" />
              {/* Waving hand */}
              <g style={{ transformOrigin: "108px 40px" }} className="animate-[wave_1.4s_ease-in-out_infinite]">
                <circle cx="108" cy="38" r="9" fill="url(#face)" stroke="#5A2CA0" strokeWidth="3" />
              </g>
            </>
          )}
          {state === "point" && (
            <>
              {/* Wide sparkling eyes */}
              <circle cx="46" cy="60" r="5" fill="#5A2CA0" />
              <circle cx="47" cy="58" r="1.6" fill="white" />
              <circle cx="74" cy="60" r="5" fill="#5A2CA0" />
              <circle cx="75" cy="58" r="1.6" fill="white" />
              {/* Excited open smile */}
              <ellipse cx="60" cy="82" rx="9" ry="6" fill="#7A2FA0" stroke="#5A2CA0" strokeWidth="2.5" />
              {/* Down-point arm */}
              <g style={{ transformOrigin: "26px 88px" }}>
                <circle cx="22" cy="96" r="8" fill="url(#face)" stroke="#5A2CA0" strokeWidth="3" />
                <path d="M22 96 L22 108" stroke="#5A2CA0" strokeWidth="3" strokeLinecap="round" />
              </g>
            </>
          )}
          {state === "sleep" && (
            <>
              {/* Closed eyes (Z) */}
              <path d="M40 60 L52 60" stroke="#5A2CA0" strokeWidth="4" strokeLinecap="round" />
              <path d="M68 60 L80 60" stroke="#5A2CA0" strokeWidth="4" strokeLinecap="round" />
              {/* Small O mouth */}
              <circle cx="60" cy="82" r="4" fill="#7A2FA0" />
              {/* Zzz */}
              <text x="88" y="30" fontSize="16" fontWeight="700" fill="#5A2CA0">z</text>
              <text x="98" y="20" fontSize="12" fontWeight="700" fill="#5A2CA0" opacity="0.7">z</text>
            </>
          )}
        </svg>
      </div>
      <style>{`
        @keyframes wave {
          0%,100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
      `}</style>
    </div>
  );
}
