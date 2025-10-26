"use client";

import { useAudio } from "@/contexts/AudioProvider";

function Row({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-200">{label}</span>
        <span className="tabular-nums text-neutral-400">{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        className="w-full accent-emerald-400"
        aria-label={label}
      />
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function MoodSliders() {
  const audio = useAudio();
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <Row
        label="Intensity"
        value={audio.intensity ?? 0.85}
        onChange={audio.setIntensity}
        hint="overall volume"
      />
      <Row
        label="Calm"
        value={audio.calm ?? 0}
        onChange={audio.setCalm}
        hint="softer highs (low-pass)"
      />
      <Row
        label="Nature"
        value={audio.nature ?? 0.5}
        onChange={audio.setNature}
        hint="warmth (low-shelf)"
      />
    </div>
  );
}