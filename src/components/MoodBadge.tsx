"use client";

import { useAudio } from "@/contexts/AudioProvider";

function computeLabel(intensity: number, calm: number) {
  // score: energia percepita (intensity) mitigata dalla calma
  const score = intensity * (1 - 0.5 * calm);
  if (score < 0.35) return { label: "Soothing", tone: "soothing" };
  if (score < 0.65) return { label: "Balanced", tone: "balanced" };
  return { label: "Intense", tone: "intense" };
}

export default function MoodBadge() {
  const { intensity = 0.85, calm = 0 } = useAudio();
  const { label, tone } = computeLabel(intensity, calm);

  const toneClass =
    tone === "soothing"
      ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
      : tone === "balanced"
      ? "bg-teal-900/30 text-teal-200 border-teal-700/40"
      : "bg-cyan-900/30 text-cyan-200 border-cyan-700/40";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}
      title="Mood summary"
    >
      {label}
    </span>
  );
}