"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/contexts/AudioProvider";

export function useRms() {
  const audio = useAudio();
  const [rms, setRms] = useState(0);

  const rafRef = useRef<number | null>(null);

  // 👇 Tipizziamo esplicitamente il buffer come Uint8Array<ArrayBuffer>
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const analyser = audio.getAnalyser();
    if (!analyser) return; // non inizializzato ancora

    // (Ri)alloco buffer: uso un ArrayBuffer "puro" e lo avvolgo in Uint8Array tipizzata
    if (!dataRef.current || dataRef.current.length !== analyser.fftSize) {
      const buf: ArrayBuffer = new ArrayBuffer(analyser.fftSize);
      const arr: Uint8Array<ArrayBuffer> = new Uint8Array(buf as ArrayBuffer);
      dataRef.current = arr;
    }

    const loop = () => {
      const data = dataRef.current!;
      // ✅ ora la firma combacia: Uint8Array<ArrayBuffer>
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128; // normalizza a -1..1
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
  }, [audio, audio.status]);

  return rms;
}