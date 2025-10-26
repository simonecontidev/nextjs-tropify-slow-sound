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

type AudioContextValueExtended = AudioContextValue & {
  getAnalyser: () => AnalyserNode | null; // ⤴️ nuovo
};

const Ctx = createContext<AudioContextValueExtended | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);

  const [status, setStatus] = useState<AudioStatus>("idle");
  const [current, setCurrent] = useState<SceneRef | undefined>(undefined);

  const ensureEngine = () => {
    if (!engineRef.current) engineRef.current = new AudioEngine();
    return engineRef.current;
  };

  const value = useMemo<AudioContextValueExtended>(() => {
    return {
      status,
      current,

      init: async () => {
        const eng = ensureEngine();
        await eng.init();
        setStatus("ready");
      },

      play: async (scene?: SceneRef) => {
        const eng = ensureEngine();
        await eng.init();
        await eng.resume();

        if (scene) setCurrent(scene);
        const slug = (scene?.slug || current?.slug || "evening-rain") as SceneName;
        eng.playSlug(slug, 0.85);
        setStatus("playing");
      },

      pause: async () => {
        const eng = ensureEngine();
        eng.pauseAll();
        setTimeout(() => {
          eng.suspend();
          setStatus("paused");
        }, 900);
      },

      setScene: (scene: SceneRef) => {
        setCurrent(scene);
      },

      // ⤵️ bridge per il visualizer
      getAnalyser: () => {
        try {
          const eng = ensureEngine();
          // se non inizializzato, torna null: chi usa l’hook gestirà
          return eng.getAnalyser?.() ?? null;
        } catch {
          return null;
        }
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