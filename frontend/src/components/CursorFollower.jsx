import { useEffect, useRef } from "react";

const SHEET = "https://customer-assets.emergentagent.com/job_kidz-essentials-3d/artifacts/o6veuyg4_Untitled%20design%20%281%29.png";

/**
 * Cursor-follower mascot.
 * - Uses waving pose from sprite sheet (approx 74% X position, sheet has 5 poses side-by-side).
 * - Smooth lerp toward cursor with easing (feels like ease-in-out).
 * - Tilts based on horizontal velocity (fast right => 15°, fast left => -15°).
 * - pointer-events: none so clicks pass through.
 * - Auto-disabled on touch devices.
 */
export default function CursorFollower() {
  const ref = useRef(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const prev = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Skip on touch-primary devices
    if (matchMedia("(pointer: coarse)").matches) return;

    const move = (e) => { target.current.x = e.clientX; target.current.y = e.clientY; };
    window.addEventListener("mousemove", move, { passive: true });

    let raf;
    const tick = () => {
      const p = pos.current, t = target.current;
      // ease-in-out via low lerp factor
      p.x += (t.x - p.x) * 0.15;
      p.y += (t.y - p.y) * 0.15;
      const vx = p.x - prev.current.x;
      const rot = Math.max(-18, Math.min(18, vx * 1.4));
      if (ref.current) {
        ref.current.style.transform =
          `translate3d(${p.x - 32}px, ${p.y - 32}px, 0) rotate(${rot}deg)`;
      }
      prev.current.x = p.x;
      prev.current.y = p.y;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="cursor-follower"
      style={{
        position: "fixed", top: 0, left: 0, width: 64, height: 64,
        pointerEvents: "none", zIndex: 9999,
        willChange: "transform",
        transition: "transform 60ms linear",
      }}
    >
      <div
        style={{
          width: 64, height: 64,
          backgroundImage: `url(${SHEET})`,
          backgroundSize: "500% 100%",   // 5 poses side-by-side
          backgroundPosition: "74% 50%", // waving pose
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 6px 10px rgba(90,44,160,0.25))",
        }}
      />
    </div>
  );
}
