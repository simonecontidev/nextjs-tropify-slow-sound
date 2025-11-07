"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";

const QUOTES = [
  "Breathe. The world will wait.",
  "Silence is also a sound.",
  "Every rhythm has its own peace.",
  "Listen to what remains between the waves.",
  "Even stillness moves, if you stay long enough.",
];

export default function HeroQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to({}, { duration: 10, onComplete: () => setIndex((i) => (i + 1) % QUOTES.length) });
    return () => { tl.kill(); }; 
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".quote-line",
      { opacity: 0, y: 8, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power2.out" }
    );
  }, [index]);

  return (
    <div className="mt-10 text-center text-lg sm:text-xl text-neutral-300 italic tracking-wide">
      <p key={index} className="quote-line inline-block">
        {QUOTES[index]}
      </p>
    </div>
  );
}