"use client";

import { useEffect, useRef } from "react";
import { useRms } from "@/hooks/useRms";

export default function ZenVisualizer() {
  const rms = useRms();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const rmsRef = useRef(0); // buffer per l’ultimo rms “vivo” nel loop

  // aggiorna il valore RMS in un ref, senza ricreare il loop
  useEffect(() => {
    rmsRef.current = rms;
  }, [rms]);

  // setup una sola volta: canvas, resize observer, animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { clientWidth: cw, clientHeight: ch } = canvas;
      // reset transform e poi scala con DPR (evita cumulo di scale)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    roRef.current = ro;

    let smooth = 0;
    let running = true;

    const render = () => {
      if (!running) return;

      // leggi l’ultimo rms aggiornato
      const r = rmsRef.current;
      // lerp morbido
      smooth += (r - smooth) * 0.12;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const base = Math.min(w, h) * 0.22;
      const pulse = base * (1 + smooth * 0.9);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.12)"; // emerald-500/12%
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []); // 👈 una sola volta

  return (
    <div className="mt-6 h-[200px] sm:h-[280px] md:h-[340px] rounded-2xl bg-neutral-900/40 border border-neutral-800/60 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}