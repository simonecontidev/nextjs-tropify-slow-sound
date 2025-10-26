"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition-colors border",
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-neutral-700/40 bg-neutral-900/40 text-neutral-300 hover:border-neutral-600"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  // piccola ombra quando si scrolla
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/20",
        scrolled ? "border-b border-neutral-800/60 shadow-[0_1px_0_0_rgba(255,255,255,0.02)]" : "border-b border-transparent"
      ].join(" ")}
      role="banner"
      style={{ backgroundColor: "transparent" }} // lasciamo il body gestire il bg
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-black/60 px-3 py-1.5 text-neutral-100">
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-medium tracking-tight text-neutral-200 hover:text-neutral-50">
          Tropify<span className="text-neutral-400"> - </span><span className="text-neutral-300">The Slow Sound Garden</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-2">
            <li><NavLink href="/moment">Moments</NavLink></li>
            <li><NavLink href="/listen/evening-rain">Listen</NavLink></li>
            <li><NavLink href="/journal">Journal</NavLink></li> {/* placeholder, puoi creare la pagina dopo */}
            <li><NavLink href="/about">About</NavLink></li>     {/* placeholder */}
          </ul>
        </nav>
      </div>
    </header>
  );
}