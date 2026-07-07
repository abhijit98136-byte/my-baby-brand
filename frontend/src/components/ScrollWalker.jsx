import { useEffect, useRef, useState } from "react";

const SHEET = "https://customer-assets.emergentagent.com/job_kidz-essentials-3d/artifacts/o6veuyg4_Untitled%20design%20%281%29.png";

/**
 * Scroll-triggered walker mascot (bottom-right corner).
 * - Vertical position climbs upward as user scrolls DOWN, walks DOWN when scrolling up.
 * - Alternates between "leap" pose (mid-scroll motion) and "stand" pose (idle).
 * - Uses backgroundPosition to crop 1 of 5 poses in the composite sprite sheet.
 * - Flip horizontally when reversing direction.
 * - RequestAnimationFrame throttled — mobile-friendly.
 */
export default function ScrollWalker() {
  const [bottomPx, setBottomPx] = useState(20);
  const [pose, setPose] = useState("stand"); // stand | leap
  const [flipped, setFlipped] = useState(false);
  const lastY = useRef(0);
  const idleTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, y / h));
      // Climb from bottom 20px up to (viewport - 120px)
      const range = Math.max(200, window.innerHeight - 180);
      setBottomPx(20 + p * range);
      const dy = y - lastY.current;
      if (Math.abs(dy) > 2) {
        setPose("leap");
        setFlipped(dy < 0); // scrolling up => face down/back
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setPose("stand"), 260);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(idleTimer.current); };
  }, []);

  // Sprite positions: pose 1 (stand) ≈ 10%, pose 3 (jump/leap) ≈ 52%
  const bgPos = pose === "leap" ? "52% 50%" : "10% 50%";

  return (
    <div
      aria-hidden="true"
      data-testid="scroll-walker"
      style={{
        position: "fixed",
        right: 96,               // sits left of WhatsApp/Chatbot buttons
        bottom: bottomPx,
        width: 72, height: 72,
        pointerEvents: "none",
        zIndex: 39,
        transition: "bottom 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: flipped ? "scaleX(-1)" : "none",
        willChange: "bottom, transform",
      }}
    >
      <div
        style={{
          width: 72, height: 72,
          backgroundImage: `url(${SHEET})`,
          backgroundSize: "500% 100%",
          backgroundPosition: bgPos,
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 8px 14px rgba(122,47,160,0.28))",
          animation: pose === "leap" ? "walkbob 0.35s ease-in-out infinite alternate" : "idlebob 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes walkbob { from { transform: translateY(0) rotate(-4deg); } to { transform: translateY(-6px) rotate(4deg); } }
        @keyframes idlebob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
