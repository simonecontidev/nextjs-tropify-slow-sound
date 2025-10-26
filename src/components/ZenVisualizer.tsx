"use client";

import { useEffect, useRef } from "react";
import { useRms } from "@/hooks/useRms";
import { useAudio } from "@/contexts/AudioProvider";

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function ZenVisualizer() {
  // leggi i valori ma NON usarli direttamente nell'effetto principale
  const rms = useRms();
  const audio = useAudio();

  // refs per i valori correnti (niente re-render)
  const rmsRef = useRef(0);
  const intensityRef = useRef(0.85);
  const calmRef = useRef(0);
  const natureRef = useRef(0.5);

  // aggiorna i ref quando cambiano (ma non ricreiamo il loop)
  useEffect(() => { rmsRef.current = rms || 0; }, [rms]);
  useEffect(() => { intensityRef.current = audio.intensity ?? 0.85; }, [audio.intensity]);
  useEffect(() => { calmRef.current = audio.calm ?? 0; }, [audio.calm]);
  useEffect(() => { natureRef.current = audio.nature ?? 0.5; }, [audio.nature]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  // stati smussati per i colori (hsl) e per il respiro
  const smoothRmsRef = useRef(0);
  const hueRef = useRef(150);   // emerald-base
  const satRef = useRef(48);    // %
  const lightRef = useRef(10);  // %

  const originalBodyBgRef = useRef<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // salva bg originale
    originalBodyBgRef.current = document.body.style.backgroundColor || "";

    // resize + DPR
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      const { clientWidth: cw, clientHeight: ch } = canvas;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    roRef.current = ro;

    let running = true;

    const render = () => {
      if (!running) return;

      // valori correnti (senza triggerare re-render)
      const intensity = clamp01(intensityRef.current ?? 0.85);
      const calm = clamp01(calmRef.current ?? 0);
      const nature = clamp01(natureRef.current ?? 0.5);
      const rmsNow = clamp01(rmsRef.current ?? 0);

      // 1) VELOCITÀ DEL “RESPIRO” LEGATA A CALM
      const speed = lerp(0.16, 0.04, calm); // calm↑ → più lento
      smoothRmsRef.current += (rmsNow - smoothRmsRef.current) * speed;
      const smooth = smoothRmsRef.current;

      // 2) PALETTE DINAMICA (HSL)
      const baseHue = 150;   // verde
      const calmHue = 200;   // azzurro
      const natureHue = 142; // verde profondo
      const targetHue = lerp(lerp(baseHue, natureHue, nature), calmHue, calm);

      const targetSat = clamp01(0.35 + 0.5 * nature - 0.25 * calm) * 100; // %
      const targetLight = clamp01(0.08 + 0.18 * intensity + 0.06 * calm) * 100; // %

      hueRef.current = lerp(hueRef.current, targetHue, 0.05);
      satRef.current = lerp(satRef.current, targetSat, 0.05);
      lightRef.current = lerp(lightRef.current, targetLight, 0.05);

      // 3) BG di tutta la pagina (leggermente più scuro)
      const bgLight = Math.max(4, lightRef.current - 6);
      const bodyBg = `hsl(${hueRef.current.toFixed(1)} ${satRef.current.toFixed(1)}% ${bgLight.toFixed(1)}%)`;
      document.documentElement.style.setProperty("--page-bg", bodyBg);

      // 4) Disegno cerchio (sempre più chiaro del bg)
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const base = Math.min(w, h) * 0.22;
      const amp = 0.6 + intensity * 0.6;  // ampiezza cresce con intensity
      const pulse = base * (1 + smooth * amp);

      const fillLight = Math.min(80, bgLight + 14);
      const ringLight = Math.min(92, bgLight + 22);
      const fillAlpha = 0.18 + 0.12 * smooth;

      const fill = `hsla(${hueRef.current.toFixed(1)}, ${Math.max(10, (satRef.current - 5)).toFixed(1)}%, ${fillLight.toFixed(1)}%, ${fillAlpha.toFixed(2)})`;
      const stroke = `hsla(${hueRef.current.toFixed(1)}, ${Math.max(18, (satRef.current - 8)).toFixed(1)}%, ${ringLight.toFixed(1)}%, 0.42)`;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = stroke;
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      // ripristina il bg originale del body
      document.body.style.backgroundColor = originalBodyBgRef.current;
    };
  }, []); // 👈 loop stabile UNA VOLTA SOLA

  return (
    <div
      className="mt-6 h-[200px] sm:h-[280px] md:h-[340px] rounded-2xl border border-neutral-800/60 overflow-hidden"
      aria-hidden
      style={{ backgroundColor: "transparent" }} // vogliamo vedere il body dietro
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}