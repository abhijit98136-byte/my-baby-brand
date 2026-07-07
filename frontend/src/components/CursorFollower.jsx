import { useEffect, useRef } from "react";

/**
 * Cursor-follower: single transparent SVG cluster (bear + gift + crown + sock + sneaker).
 * - Truly transparent (no white background block)
 * - Smooth lerp toward cursor (ease-in-out feel), velocity-based tilt
 * - pointer-events: none — clicks pass through to elements beneath
 * - Auto-disabled on touch devices
 */
export default function CursorFollower() {
  const ref = useRef(null);
  const target = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const prev = useRef({ x: -200, y: -200 });

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const move = (e) => { target.current.x = e.clientX; target.current.y = e.clientY; };
    window.addEventListener("mousemove", move, { passive: true });
    let raf;
    const tick = () => {
      const p = pos.current, t = target.current;
      p.x += (t.x - p.x) * 0.16;
      p.y += (t.y - p.y) * 0.16;
      const vx = p.x - prev.current.x;
      const rot = Math.max(-16, Math.min(16, vx * 1.2));
      if (ref.current) {
        ref.current.style.transform = `translate3d(${p.x - 48}px, ${p.y - 48}px, 0) rotate(${rot}deg)`;
      }
      prev.current.x = p.x; prev.current.y = p.y;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {/* Desktop: cursor follower */}
      <div
        ref={ref}
        aria-hidden="true"
        data-testid="cursor-follower"
        className="hidden md:block"
        style={{
          position: "fixed", top: 0, left: 0, width: 96, height: 96,
          pointerEvents: "none", zIndex: 9999,
          willChange: "transform",
          filter: "drop-shadow(0 8px 14px rgba(90,44,160,0.22))",
        }}
      >
        {svgCluster}
      </div>
      {/* Mobile/touch: fixed floating baby bottom-right with bob animation */}
      <div
        aria-hidden="true"
        data-testid="mobile-floater"
        className="md:hidden"
        style={{
          position: "fixed", right: 12, bottom: 96, width: 72, height: 72,
          pointerEvents: "none", zIndex: 39,
          animation: "mfloat 3.5s ease-in-out infinite",
          filter: "drop-shadow(0 8px 14px rgba(90,44,160,0.22))",
        }}
      >
        {svgCluster}
        <style>{`@keyframes mfloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(3deg); } }`}</style>
      </div>
    </>
  );
}

const svgCluster = (
      <svg viewBox="0 0 96 96" width="96" height="96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cf-face" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFF6DC" />
            <stop offset="100%" stopColor="#FFE0B5" />
          </radialGradient>
        </defs>

        {/* Center: baby bear */}
        <g transform="translate(48 46)">
          <circle r="22" fill="url(#cf-face)" stroke="#5A2CA0" strokeWidth="2.5" />
          <circle cx="-19" cy="-6" r="6" fill="url(#cf-face)" stroke="#5A2CA0" strokeWidth="2" />
          <circle cx="19" cy="-6" r="6" fill="url(#cf-face)" stroke="#5A2CA0" strokeWidth="2" />
          <circle cx="-17" cy="-6" r="2.5" fill="#FFB6D6" opacity="0.9" />
          <circle cx="17" cy="-6" r="2.5" fill="#FFB6D6" opacity="0.9" />
          {/* Eyes */}
          <circle cx="-7" cy="-2" r="2.4" fill="#3A1670" />
          <circle cx="7" cy="-2" r="2.4" fill="#3A1670" />
          <circle cx="-6.2" cy="-2.8" r="0.9" fill="#fff" />
          <circle cx="7.8" cy="-2.8" r="0.9" fill="#fff" />
          {/* Nose + smile */}
          <ellipse cx="0" cy="6" rx="2.4" ry="1.6" fill="#5A2CA0" />
          <path d="M-5 10 Q0 14 5 10" stroke="#5A2CA0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="-11" cy="7" r="3.2" fill="#FFC7DC" opacity="0.85" />
          <circle cx="11" cy="7" r="3.2" fill="#FFC7DC" opacity="0.85" />
        </g>

        {/* Gift box (top-left) */}
        <g transform="translate(10 12)">
          <rect x="0" y="4" width="14" height="12" rx="2" fill="#FFE6F0" stroke="#5A2CA0" strokeWidth="1.4" />
          <rect x="-1" y="3" width="16" height="3.5" rx="1" fill="#DFF4FF" stroke="#5A2CA0" strokeWidth="1.4" />
          <path d="M7 3 L7 16" stroke="#5A2CA0" strokeWidth="1.2" />
          <path d="M7 3 Q4 -1 3 2 Q6 2 7 3 Q8 2 11 2 Q10 -1 7 3 Z" fill="#FFB6D6" stroke="#5A2CA0" strokeWidth="1" />
        </g>

        {/* Crown (top-right) */}
        <g transform="translate(72 10)">
          <path d="M0 10 L3 2 L7 8 L11 1 L15 8 L18 2 L18 12 L0 12 Z" fill="#F2E8FF" stroke="#5A2CA0" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="3" cy="2" r="1.4" fill="#FFB6D6" stroke="#5A2CA0" strokeWidth="0.7" />
          <circle cx="18" cy="2" r="1.4" fill="#DFF4FF" stroke="#5A2CA0" strokeWidth="0.7" />
          <rect x="0" y="12" width="18" height="1.5" fill="#5A2CA0" opacity="0.4" />
        </g>

        {/* Sock (bottom-left) */}
        <g transform="translate(6 74)">
          <path d="M2 0 L10 0 L10 8 Q10 12 6 14 L2 14 Q-2 14 -2 10 Q-2 8 2 8 Z" fill="#DFF4FF" stroke="#5A2CA0" strokeWidth="1.3" />
          <rect x="2" y="0" width="8" height="2.4" fill="#FFB6D6" />
          <path d="M2 5 L10 5" stroke="#FFB6D6" strokeWidth="1.2" />
        </g>

        {/* Sneaker (bottom-right) */}
        <g transform="translate(70 78)">
          <path d="M0 8 Q0 4 4 3 L10 3 L14 6 L18 6 Q20 6 20 9 L20 11 L-1 11 Q-1 9 0 8 Z" fill="#E8FFF1" stroke="#5A2CA0" strokeWidth="1.3" />
          <path d="M-1 11 L20 11" stroke="#5A2CA0" strokeWidth="1" />
          <circle cx="6" cy="7" r="0.8" fill="#5A2CA0" />
          <circle cx="9" cy="7" r="0.8" fill="#5A2CA0" />
          <path d="M13 3 L13 6" stroke="#FFB6D6" strokeWidth="1.4" />
        </g>
      </svg>
);
