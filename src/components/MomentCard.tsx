"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Moment } from "@/data/moments";
import { useAudio } from "@/contexts/AudioProvider";

type Props = {
  moment: Moment;
  delay?: number; // per un leggero stagger
};

export default function MomentCard({ moment, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const audio = useAudio();

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

  const isCurrent = audio.current?.slug === moment.slug;
  const isPlaying = audio.status === "playing" && isCurrent;

  const handlePreview = async (e: React.MouseEvent) => {
    // Evita che il click sul bottone attivi il link della card
    e.preventDefault();
    e.stopPropagation();

    await audio.init();

    if (isPlaying) {
      audio.pause();
      return;
    }

    audio.play({
      slug: moment.slug,
      params: { intensity: 0.5, calm: 0.7, nature: 0.6 },
    });
  };

  return (
    <div
      ref={ref}
      className="group rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700 focus-within:ring-2 focus-within:ring-emerald-400"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/audio/${moment.slug}`}
          className="min-w-0 flex-1 focus:outline-none"
        >
          <h3 className="text-xl font-medium tracking-tight">{moment.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{moment.subtitle}</p>
        </Link>

        <button
          onClick={handlePreview}
          className="shrink-0 rounded-full border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-pressed={isPlaying}
          title={isPlaying ? "Pause preview" : "Play preview"}
        >
          {isPlaying ? "❚❚" : "▶︎"}
        </button>
      </div>

      {isCurrent && (
        <div className="mt-3 text-xs text-emerald-300/80">
          {isPlaying ? "Preview playing…" : "Preview paused"}
        </div>
      )}
    </div>
  );
}