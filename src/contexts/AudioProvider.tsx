"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type {
  AudioContextValue,
  AudioStatus,
  SceneRef,
} from "@/lib/audio/types";

const Ctx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [current, setCurrent] = useState<SceneRef | undefined>(undefined);

  const value = useMemo<AudioContextValue>(() => {
    return {
      status,
      current,
      init: () => {
        // qui in futuro istanzieremo AudioContext/WebAudio nodes
        setStatus("ready");
      },
      play: (scene?: SceneRef) => {
        if (scene) setCurrent(scene);
        // qui in futuro: resume audio ctx & start nodes
        setStatus("playing");
      },
      pause: () => {
        // qui in futuro: suspend/stop nodes
        setStatus("paused");
      },
      setScene: (scene: SceneRef) => {
        setCurrent(scene);
        // qui in futuro: aggiornare parametri dei nodi audio
      },
    };
  }, [status, current]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAudio must be used within <AudioProvider>");
  }
  return ctx;
}