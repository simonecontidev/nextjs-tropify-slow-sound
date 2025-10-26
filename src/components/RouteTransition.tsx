"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export default function RouteTransition() {
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement | null>(null);

  // transizione d'ingresso per ogni rotta
  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    gsap.set(veil, {
      opacity: 1,
      scaleY: 1,
      transformOrigin: "top center",
      display: "block",
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(veil, { duration: 0.8, scaleY: 0, opacity: 0.0, onComplete: () => {
      gsap.set(veil, { display: "none" });
    }});

    return () => { tl.kill(); };
  }, [pathname]);

  return (
    <div
      ref={veilRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        backgroundColor: "var(--page-bg)",
        willChange: "transform, opacity",
      }}
      aria-hidden
    />
  );
}