"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/contexts/AudioProvider";

export function useRms() {
  const audio = useAudio();
  const [rms, setRms] = useState(0);
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const analyser = audio.getAnalyser();
    if (!analyser) return; // non inizializzato (ancora)

    if (!dataRef.current) {
      dataRef.current = new Uint8Array(analyser.fftSize);
    }

    const loop = () => {
      const data = dataRef.current!;
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128; // -1..1
        sum += v * v;
      }
      const r = Math.sqrt(sum / data.length); // 0..1 circa
      setRms(r);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audio, audio.status]); // quando cambia lo stato, ricontrolla

  return rms; // 0..~0.5 tipicamente, clamp in UI
}