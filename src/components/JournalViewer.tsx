// src/components/JournalViewer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
  slug: string;
  startedAt: number;         // epoch ms
  durationSec: number;       // durata ascolto in secondi
  params?: { intensity: number; calm: number; nature: number };
};

const LS_KEY = "tropify:journal";

export default function JournalViewer() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Entry[];
      if (Array.isArray(parsed)) setEntries(parsed);
    } catch {}
  }, []);

  const clearAll = () => {
    localStorage.removeItem(LS_KEY);
    setEntries([]);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "tropify-journal.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-neutral-800/60 bg-black/20 p-6 text-neutral-300">
        <p>Nessuna sessione salvata ancora.</p>
        <p className="mt-1">
          Ascolta una scena in{" "}
          <Link href="/moment" className="underline decoration-neutral-600 hover:text-neutral-100">
            Moments
          </Link>{" "}
          per almeno 1 minuto: nel prossimo step salveremo automaticamente il tuo “momento”.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={exportJson}
          className="rounded-full border border-neutral-700 bg-neutral-900/40 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          Export JSON
        </button>
        <button
          onClick={clearAll}
          className="rounded-full border border-neutral-700 bg-neutral-900/40 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          Clear Journal
        </button>
      </div>

      <ul className="grid gap-3">
        {entries
          .slice()
          .reverse()
          .map((e, i) => {
            const date = new Date(e.startedAt);
            const mins = Math.max(1, Math.round(e.durationSec / 60));
            const p = e.params || { intensity: 0.85, calm: 0, nature: 0.5 };
            return (
              <li
                key={i}
                className="rounded-2xl border border-neutral-800/60 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    <Link
                      href={`/listen/${e.slug}`}
                      className="hover:underline decoration-neutral-600"
                    >
                      {e.slug}
                    </Link>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {date.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-sm text-neutral-300">
                  {mins} min • Intensity {(p.intensity * 100).toFixed(0)}% • Calm{" "}
                  {(p.calm * 100).toFixed(0)}% • Nature {(p.nature * 100).toFixed(0)}%
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}