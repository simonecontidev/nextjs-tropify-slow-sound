// src/components/Breathing.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAudio } from "@/contexts/AudioProvider";
import { useRms } from "@/hooks/useRms";

type Props = { speed?: number };

export default function Breathing({ speed = 1 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  // slider/mood + livello audio
  const { intensity = 0.85, calm = 0, nature = 0.5 } = useAudio();
  const rms = useRms() ?? 0;

  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const core = coreRef.current!;
    const ring = ringRef.current!;
    const aura = auraRef.current!;

    const ctx = gsap.context(() => {
      // ---------------------------
      // Palette iniziale via CSS vars (HSL)
      // ---------------------------
      const hueBase = gsap.utils.interpolate(
        gsap.utils.interpolate(150, 142, nature), // → più “foglie” con Nature
        200,                                      // → più azzurro con Calm
        calm
      );
      const sat = gsap.utils.clamp(30, 70, 35 + 50 * nature - 25 * calm);
      const light = gsap.utils.clamp(8, 28, 8 + 18 * intensity + 6 * calm);

      gsap.set(wrap, {
        "--h": hueBase,
        "--s": `${sat}%`,
        "--l": `${light}%`,
      } as any);

      // ---------------------------
      // 1) Intro (600ms): fade + scale + blur
      // ---------------------------
      gsap.set([wrap, core, ring, aura], {
        opacity: 0,
        scale: 0.94,
        filter: "blur(12px)",
        transformOrigin: "50% 50%",
      });

      const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
      intro
        .to(wrap, { opacity: 1, duration: 0.2 })
        .to(
          [core, ring, aura],
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.6,
            stagger: 0.06,
            clearProps: "filter",
          },
          "<"
        );

      // ---------------------------
      // 2) Respiro infinito (durata dipende da Calm e prop speed)
      // ---------------------------
      const baseScale = 1.0;
      const amp = 0.06 + intensity * 0.05; // ampiezza legata a Intensity

      // Calm 0→1 mappa 5s→10s; poi dividiamo per `speed` (speed>1 ⇒ più veloce)
      const durBase = gsap.utils.mapRange(0, 1, 5.0, 10.0, calm);
      const dur = Math.max(1.5, durBase / Math.max(0.1, speed));

      const breath = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { ease: "sine.inOut" },
        delay: 0.05, // micro pausa dopo l'intro
      });

      breath
        .to(core, { scale: baseScale + amp, duration: dur })
        .to(ring, { scale: baseScale + amp * 1.08, duration: dur }, "<")
        .to(aura, { scale: baseScale + amp * 1.12, duration: dur }, "<");

      // Glow che pulsa in sincronia
      gsap.to(aura, {
        keyframes: [
          { opacity: 0.20, filter: "blur(22px)", duration: dur * 0.45, ease: "sine.inOut" },
          { opacity: 0.32, filter: "blur(30px)", duration: dur * 0.55, ease: "sine.inOut" },
        ],
        repeat: -1,
        yoyo: true,
      });

      // Micro drift organico (evita staticità perfetta)
      gsap.to([core, ring], {
        xPercent: gsap.utils.random(-0.3, 0.3, true),
        yPercent: gsap.utils.random(-0.3, 0.3, true),
        duration: gsap.utils.random(3, 6, true),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // ---------------------------
      // 3) Parallax dolce al mouse (inerzia, senza reflow)
      // ---------------------------
      const qCoreX = gsap.quickTo(core, "x", { duration: 0.6, ease: "sine.out" });
      const qCoreY = gsap.quickTo(core, "y", { duration: 0.6, ease: "sine.out" });
      const qRingX = gsap.quickTo(ring, "x", { duration: 0.8, ease: "sine.out" });
      const qRingY = gsap.quickTo(ring, "y", { duration: 0.8, ease: "sine.out" });
      const qAuraX = gsap.quickTo(aura, "x", { duration: 1.0, ease: "sine.out" });
      const qAuraY = gsap.quickTo(aura, "y", { duration: 1.0, ease: "sine.out" });

      const onMove = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        const strength = 12; // px
        qCoreX(nx * strength);
        qCoreY(ny * strength);
        qRingX(nx * strength * 0.6);
        qRingY(ny * strength * 0.6);
        qAuraX(nx * strength * 0.4);
        qAuraY(ny * strength * 0.4);
      };
      wrap.addEventListener("mousemove", onMove);

      // ---------------------------
      // 4) Aggiornamento cromatico dolce (30fps circa)
      // ---------------------------
      const updateColor = () => {
        const rmsBoost = Math.min(1, rms * 1.6); // leggero boost con RMS
        const h = gsap.utils.interpolate(
          gsap.utils.interpolate(150, 142, nature),
          200,
          calm
        );
        const s = gsap.utils.clamp(30, 70, 35 + 50 * nature - 25 * calm);
        const l = gsap.utils.clamp(8, 28, 8 + 18 * intensity + 6 * calm + rmsBoost * 2);

        wrap.style.setProperty("--h", String(h.toFixed(1)));
        wrap.style.setProperty("--s", `${s.toFixed(1)}%`);
        wrap.style.setProperty("--l", `${l.toFixed(1)}%`);
      };
      gsap.ticker.add(updateColor);

      return () => {
        wrap.removeEventListener("mousemove", onMove);
        gsap.ticker.remove(updateColor);
        gsap.killTweensOf([wrap, core, ring, aura]);
      };
    }, wrapRef);

    return () => ctx.revert();
  }, [intensity, calm, nature, rms, speed]);

  return (
    <div className="flex items-center justify-center py-24">
      <div
        ref={wrapRef}
        className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64"
        style={
          {
            // @ts-ignore
            "--h": 150,
            "--s": "48%",
            "--l": "12%",
          } as React.CSSProperties
        }
        aria-hidden
      >
        {/* AURA */}
        <div
          ref={auraRef}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, hsl(var(--h) var(--s) calc(var(--l) + 16%)) 0%, transparent 70%)",
            opacity: 0.26,
            filter: "blur(26px)",
            willChange: "transform, opacity, filter",
          }}
        />
        {/* RING */}
        <div
          ref={ringRef}
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 0 1px hsl(var(--h) var(--s) calc(var(--l) + 18%)) inset",
            willChange: "transform",
          }}
        />
        {/* CORE */}
        <div
          ref={coreRef}
          className="absolute inset-0 rounded-full shadow-inner"
          style={{
            background:
              "radial-gradient(55% 55% at 50% 45%, hsl(var(--h) var(--s) calc(var(--l) + 12%)) 0%, hsl(var(--h) var(--s) calc(var(--l) + 6%)) 100%)",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
}