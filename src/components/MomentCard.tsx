"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Moment } from "@/data/moments";

type Props = {
  moment: Moment;
  delay?: number; // per un leggero stagger
};

export default function MomentCard({ moment, delay = 0 }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "sine.out", delay }
      );
    });
    return () => ctx.revert();
  }, [delay]);

  return (
    <Link
      ref={ref}
      href={`/play/${moment.slug}`}
      className="group block rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium tracking-tight">{moment.title}</h3>
        <div className="h-8 w-8 rounded-full border border-emerald-400/40 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors will-change-transform" />
      </div>
      <p className="mt-2 text-sm text-neutral-400">{moment.subtitle}</p>
    </Link>
  );
}