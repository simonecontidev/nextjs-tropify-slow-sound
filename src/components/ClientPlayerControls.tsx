"use client";

import { useEffect, useMemo } from "react";
import { useAudio } from "@/contexts/AudioProvider";

type Props = {
  slug: string; // 'evening-rain' | 'morning-mist' | 'tropical-noon' | 'midnight-garden'
};

export default function ClientPlayerControls({ slug }: Props) {
  const audio = useAudio();

  // preset base per ogni momento
  const preset = useMemo(() => {
    switch (slug) {
      case "evening-rain":
        return { rain: 0.7, waves: 0.25, leaves: 0.15, master: 0.85 };
      case "morning-mist":
        return { rain: 0.15, waves: 0.35, leaves: 0.45, master: 0.75 };
      case "tropical-noon":
        return { rain: 0.10, waves: 0.55, leaves: 0.35, master: 0.82 };
      case "midnight-garden":
        return { rain: 0.20, waves: 0.20, leaves: 0.60, master: 0.70 };
      default:
        return { rain: 0.5, waves: 0.4, leaves: 0.3, master: 0.8 };
    }
  }, [slug]);

  // opzionale: all'ingresso pagina, ferma eventuale preview rimasta attiva
  useEffect(() => {
    if (audio.status === "playing" && audio.current?.slug !== slug) {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const isPlaying = audio.status === "playing" && audio.current?.slug === slug;

  const handlePlay = async () => {
    // play imposta anche la scena corrente
    await audio.play({
      slug,
      params: { intensity: 0.5, calm: 0.7, nature: 0.6 },
    });
  };

  const handlePause = () => {
    audio.pause();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePlay}
        className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
        aria-pressed={isPlaying}
      >
        ▶︎ {isPlaying ? "Playing" : "Play"}
      </button>

      <button
        onClick={handlePause}
        className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
        disabled={!isPlaying}
      >
        ❚❚ Pause
      </button>

      <span className="ml-2 text-xs text-neutral-500">
        status: {audio.status}{audio.current?.slug ? ` • ${audio.current.slug}` : ""}
      </span>
    </div>
  );
}