"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Breathing() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Crea un contesto GSAP che si ripulisce correttamente con React 18 StrictMode
    const ctx = gsap.context(() => {
      if (!ref.current) return;

      gsap.set(ref.current, { transformOrigin: "50% 50%" });

      gsap.timeline({ repeat: -1, yoyo: true })
        .to(ref.current, {
          scale: 1.06,
          duration: 6,
          ease: "sine.inOut",
          force3D: true,
        });
    });

    return () => {
      ctx.revert(); // cleanup sicuro
    };
  }, []);

  return (
    <div className="flex items-center justify-center py-24">
      <div
        ref={ref}
        aria-hidden="true"
        className="h-40 w-40 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 shadow-inner will-change-transform"
      />
    </div>
  );
}