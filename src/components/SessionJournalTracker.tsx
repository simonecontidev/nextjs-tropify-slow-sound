"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/contexts/AudioProvider";

type Entry = {
  id: string;                // unique per sessione
  slug: string;
  startedAt: number;         // epoch ms
  durationSec: number;       // secondi accumulati
  params: { intensity: number; calm: number; nature: number };
};

const LS_KEY = "tropify:journal";
const CREATE_THRESHOLD_SEC = 5;         
const MERGE_WINDOW_MS = 5 * 60 * 1000;   

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

function findMergeCandidate(entries: Entry[], slug: string): number {
  const now = Date.now();
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.slug === slug && now - e.startedAt <= MERGE_WINDOW_MS) {
      return i;
    }
  }
  return -1;
}

export default function SessionJournalTracker({ slug }: { slug: string }) {
  const audio = useAudio();

  // stato runtime della sessione corrente (non in React state = niente re-render)
  const activeIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const playedMsRef = useRef(0);          // ms accumulati (solo quando playing)
  const lastTickRef = useRef<number | null>(null);
  const savedOnceRef = useRef(false);     // è stata creata l'entry (dopo 60s)?
  const tickerRef = useRef<number | null>(null);
  const persistTickRef = useRef<number | null>(null);

  // snapshot parametri al momento della creazione
  const paramsRef = useRef({
    intensity: audio.intensity ?? 0.85,
    calm: audio.calm ?? 0,
    nature: audio.nature ?? 0.5,
  });

  // aggiorna lo snapshot quando cambiano (verrà usato al prossimo save)
  useEffect(() => { paramsRef.current.intensity = audio.intensity ?? 0.85; }, [audio.intensity]);
  useEffect(() => { paramsRef.current.calm = audio.calm ?? 0; }, [audio.calm]);
  useEffect(() => { paramsRef.current.nature = audio.nature ?? 0.5; }, [audio.nature]);

  // (Ri)avvia il contatore quando lo status è "playing"
  useEffect(() => {
    const now = Date.now();

    if (audio.status === "playing") {
      if (!startedAtRef.current) {
        // nuova (sub)sessione
        startedAtRef.current = now;
        lastTickRef.current = now;

        // genera id o riusa una entry recente per merge
        const entries = load();
        const idx = findMergeCandidate(entries, slug);
        if (idx >= 0) {
          activeIdRef.current = entries[idx].id;
          // ripartiamo da quella durata
          playedMsRef.current = entries[idx].durationSec * 1000;
          savedOnceRef.current = true; // esiste già
        } else {
          activeIdRef.current = `${slug}-${now}`;
          savedOnceRef.current = false;
          playedMsRef.current = 0;
        }
      }

      // ticker 10Hz per precisione di accumulo
      if (!tickerRef.current) {
        tickerRef.current = window.setInterval(() => {
          const t = Date.now();
          if (lastTickRef.current != null) {
            playedMsRef.current += t - lastTickRef.current;
          }
          lastTickRef.current = t;

          // se superiamo la soglia e non abbiamo salvato ancora → crea o aggiorna
          if (!savedOnceRef.current && playedMsRef.current >= CREATE_THRESHOLD_SEC * 1000) {
            const entries = load();
            const id = activeIdRef.current!;
            const idx = entries.findIndex((e) => e.id === id);
            const entry: Entry = {
              id,
              slug,
              startedAt: startedAtRef.current!,
              durationSec: Math.round(playedMsRef.current / 1000),
              params: { ...paramsRef.current },
            };
            if (idx >= 0) entries[idx] = entry;
            else entries.push(entry);
            save(entries);
            savedOnceRef.current = true;
          }
        }, 100);
      }

      // persistenza soft ogni 5s se già creata
      if (!persistTickRef.current) {
        persistTickRef.current = window.setInterval(() => {
          if (!savedOnceRef.current) return;
          const entries = load();
          const id = activeIdRef.current!;
          const idx = entries.findIndex((e) => e.id === id);
          if (idx >= 0) {
            entries[idx].durationSec = Math.round(playedMsRef.current / 1000);
            entries[idx].params = { ...paramsRef.current };
            save(entries);
          }
        }, 5000);
      }
    } else {
      // non playing → pausa l'accumulo
      lastTickRef.current = null;
    }

    return () => {
      // cleanup timer quando cambia status o unmount
      if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
      if (persistTickRef.current) { clearInterval(persistTickRef.current); persistTickRef.current = null; }
      // persiste allo smontaggio se c'è un'entry salvata
      if (savedOnceRef.current && activeIdRef.current) {
        const entries = load();
        const idx = entries.findIndex((e) => e.id === activeIdRef.current);
        if (idx >= 0) {
          entries[idx].durationSec = Math.round(playedMsRef.current / 1000);
          entries[idx].params = { ...paramsRef.current };
          save(entries);
        }
      } else if (!savedOnceRef.current) {
        // se < soglia → non salva nulla (diario rimane pulito)
      }
    };
  }, [audio.status, slug]);

  return null; // componente invisibile
}