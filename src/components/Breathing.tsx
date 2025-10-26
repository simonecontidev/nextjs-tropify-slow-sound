"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Breathing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(ref.current, { scale: 1.06, duration: 6, ease: "sine.inOut" });

    // Cleanup function senza return value
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="flex items-center justify-center py-24">
      <div
        ref={ref}
        aria-hidden="true"
        className="h-40 w-40 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 shadow-inner"
      />
    </div>
  );
}