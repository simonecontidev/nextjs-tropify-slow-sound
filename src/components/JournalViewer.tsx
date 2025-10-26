// src/components/JournalViewer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
  id?: string; // compat: alcune entry più vecchie potrebbero non averlo
  slug: string;
  startedAt: number;         // epoch ms
  durationSec: number;       // durata ascolto in secondi
  params?: { intensity: number; calm: number; nature: number };
  note?: string;             // 👈 nuova proprietà
};

const LS_KEY = "tropify:journal";

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function save(entries: Entry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

export default function JournalViewer() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setEntries(load());
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

  const startEdit = (e: Entry, idx: number) => {
    // id di fallback se mancante
    const id = e.id ?? `${e.slug}-${e.startedAt}`;
    // normalizza in memoria
    if (!e.id) {
      const next = entries.slice();
      next[idx] = { ...e, id };
      save(next);
      setEntries(next);
    }
    setEditingId(id);
    setDraft(e.note ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveNote = (id: string) => {
    const next = entries.slice();
    const idx = next.findIndex((x) => (x.id ?? `${x.slug}-${x.startedAt}`) === id);
    if (idx >= 0) {
      next[idx] = { ...next[idx], id, note: draft.trim() || undefined };
      save(next);
      setEntries(next);
    }
    setEditingId(null);
    setDraft("");
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
          per almeno 1 minuto: il diario si compilerà automaticamente e potrai aggiungere note personali.
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
          .map((e, iRev) => {
            // invertendo, l’indice reale è:
            const idx = entries.length - 1 - iRev;
            const id = e.id ?? `${e.slug}-${e.startedAt}`;
            const date = new Date(e.startedAt);
            const mins = Math.max(1, Math.round(e.durationSec / 60));
            const p = e.params || { intensity: 0.85, calm: 0, nature: 0.5 };
            const isEditing = editingId === id;

            return (
              <li
                key={id}
                className="rounded-2xl border border-neutral-800/60 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listen/${e.slug}`}
                        className="font-medium hover:underline decoration-neutral-600"
                      >
                        {e.slug}
                      </Link>
                      <span className="text-[11px] text-neutral-500">
                        {mins} min
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {date.toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm text-neutral-300">
                      Intensity {(p.intensity * 100).toFixed(0)}% • Calm {(p.calm * 100).toFixed(0)}% • Nature {(p.nature * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(e, idx)}
                        className="rounded-full border border-neutral-700 bg-neutral-900/40 px-3 py-1.5 text-sm hover:border-neutral-600"
                        aria-label={e.note ? "Edit note" : "Add a note"}
                        title={e.note ? "Edit note" : "Add a note"}
                      >
                        {e.note ? "Edit note" : "Add a note"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => saveNote(id)}
                          className="rounded-full border border-emerald-700 bg-emerald-600/20 px-3 py-1.5 text-sm text-emerald-200 hover:border-emerald-600"
                          aria-label="Save note"
                          title="Save note"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-full border border-neutral-700 bg-neutral-900/40 px-3 py-1.5 text-sm hover:border-neutral-600"
                          aria-label="Cancel"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* NOTE AREA */}
                {!isEditing && e.note && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl border border-neutral-800/60 bg-black/30 p-3 text-sm text-neutral-200">
                    {e.note}
                  </p>
                )}

                {isEditing && (
                  <div className="mt-3">
                    <label htmlFor={`note-${id}`} className="sr-only">
                      Note for {e.slug}
                    </label>
                    <textarea
                      id={`note-${id}`}
                      value={draft}
                      onChange={(ev) => setDraft(ev.currentTarget.value)}
                      placeholder="Scrivi una nota personale su questo momento (facoltativa)…"
                      className="w-full rounded-xl border border-neutral-700 bg-black/30 p-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      rows={3}
                    />
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Suggerimento: puoi annotare come ti sentivi, cosa stavi facendo, o un pensiero.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}