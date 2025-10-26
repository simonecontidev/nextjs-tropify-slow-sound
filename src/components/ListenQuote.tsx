"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAudio } from "@/contexts/AudioProvider";

const QUOTES = {
  calm: [
    "Slow down until even silence has a rhythm.",
    "The calm is not absence — it’s presence at peace.",
    "Listen closely: the stillness hums.",
  ],
  balanced: [
    "Every wave knows when to return.",
    "In balance, even sound becomes light.",
    "The world breathes back when you breathe in.",
  ],
  intense: [
    "Rain becomes thunder when you listen deeply.",
    "Let the pulse move through you, not against you.",
    "Energy and peace are two names of the same breath.",
  ],
};

export default function ListenQuote() {
  const { calm = 0 } = useAudio();
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState<"calm" | "balanced" | "intense">(
    "balanced"
  );
  const ref = useRef<HTMLParagraphElement>(null);

  // cambia categoria in base al calm
  useEffect(() => {
    if (calm > 0.65) setCategory("calm");
    else if (calm < 0.35) setCategory("intense");
    else setCategory("balanced");
  }, [calm]);

  // cambio frase ogni 7 secondi
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to({}, { duration: 7, onComplete: () => setIndex((i) => i + 1) });
    return () => tl.kill();
  }, []);

  const quoteList = QUOTES[category];
  const q = quoteList[index % quoteList.length];

  // animazione di ingresso e “respiro” continuo
  useEffect(() => {
    if (!ref.current) return;

    // fade+blur+up all’apparizione
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 8, filter: "blur(8px)", letterSpacing: "0.02em" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power2.out",
      }
    );

    // respiro continuo (scale + letterSpacing)
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    tl.to(ref.current, {
      scale: 1.02,
      letterSpacing: "0.05em",
      duration: 4,
    });

    return () => tl.kill();
  }, [q]);

  return (
    <div className="mt-8 text-center text-lg sm:text-xl text-neutral-400 italic tracking-wide leading-relaxed">
      <p ref={ref} key={q} className="listen-quote inline-block will-change-transform">
        {q}
      </p>
    </div>
  );
}