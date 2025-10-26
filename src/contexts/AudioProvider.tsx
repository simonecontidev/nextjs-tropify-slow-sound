"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AudioContextValue,
  AudioStatus,
  SceneRef,
} from "@/lib/audio/types";
import { AudioEngine, type SceneName } from "@/lib/audio/engine";

const Ctx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);

  const [status, setStatus] = useState<AudioStatus>("idle");
  const [current, setCurrent] = useState<SceneRef | undefined>(undefined);

  const ensureEngine = () => {
    if (!engineRef.current) engineRef.current = new AudioEngine();
    return engineRef.current;
  };

  const value = useMemo<AudioContextValue>(() => {
    return {
      status,
      current,

      // Prepara l'engine (crea AudioContext, carica buffer)
      init: async () => {
        const eng = ensureEngine();
        await eng.init();
        setStatus("ready");
      },

      // Avvia la scena corrente (slug ↔ file) con fade-in morbido
      play: async (scene?: SceneRef) => {
        const eng = ensureEngine();
        await eng.init();
        await eng.resume();

        if (scene) setCurrent(scene);

        const slug = (scene?.slug || current?.slug || "evening-rain") as SceneName;
        eng.playSlug(slug, 0.85);
        setStatus("playing");
      },

      // Fade-out master e sospensione del context
      pause: async () => {
        const eng = ensureEngine();
        eng.pauseAll();
        // sospendi dopo il fade per evitare tagli
        setTimeout(() => {
          eng.suspend();
          setStatus("paused");
        }, 900);
      },

      // Aggiorna solo lo stato locale della scena (utile per UI)
      setScene: (scene: SceneRef) => {
        setCurrent(scene);
        // Se vuoi fare switch immediato:
        // const eng = ensureEngine();
        // eng.playSlug(scene.slug as SceneName, 0.85);
        // setStatus("playing");
      },
    };
  }, [status, current]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used within <AudioProvider>");
  return ctx;
}