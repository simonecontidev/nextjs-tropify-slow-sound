// src/contexts/AudioProvider.tsx
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

  // mood params (0..1)
  const [intensity, setIntensityState] = useState(0.85);
  const [calm, setCalmState] = useState(0.0);
  const [nature, setNatureState] = useState(0.5);

  const ensureEngine = () => {
    if (!engineRef.current) engineRef.current = new AudioEngine();
    return engineRef.current;
  };

  const value = useMemo<AudioContextValue>(() => {
    return {
      // stato
      status,
      current,
      intensity,
      calm,
      nature,

      // lifecycle
      init: async () => {
        const eng = ensureEngine();
        await eng.init();
        eng.setIntensity(intensity);
        eng.setCalm(calm);
        eng.setNature(nature);
        setStatus("ready");
      },

      play: async (scene?: SceneRef) => {
        const eng = ensureEngine();
        await eng.init();
        await eng.resume();

        if (scene) setCurrent(scene);
        const slug = (scene?.slug || current?.slug || "evening-rain") as SceneName;

        eng.playSlug(slug, intensity);
        eng.setIntensity(intensity);
        eng.setCalm(calm);
        eng.setNature(nature);

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

      // controlli mood
      setIntensity: (v: number) => {
        const eng = ensureEngine();
        const val = clamp01(v);
        setIntensityState(val);
        if (eng && eng.ctx) eng.setIntensity(val);
      },

      setCalm: (v: number) => {
        const eng = ensureEngine();
        const val = clamp01(v);
        setCalmState(val);
        if (eng && eng.ctx) eng.setCalm(val);
      },

      setNature: (v: number) => {
        const eng = ensureEngine();
        const val = clamp01(v);
        setNatureState(val);
        if (eng && eng.ctx) eng.setNature(val);
      },

      // bridge per visualizer
      getAnalyser: () => {
        try {
          const eng = ensureEngine();
          return eng.getAnalyser?.() ?? null;
        } catch {
          return null;
        }
      },
    };
  }, [status, current, intensity, calm, nature]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used within <AudioProvider>");
  return ctx;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}