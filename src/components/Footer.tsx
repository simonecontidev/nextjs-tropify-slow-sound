import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t border-neutral-800/60"
      role="contentinfo"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-neutral-400 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Tropify — The Slow Sound Garden</p>
        <p className="space-x-3">
          <Link href="/about" className="hover:text-neutral-200">About</Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-neutral-200">Privacy</Link>
          <span aria-hidden>·</span>
          <a
            href="https://github.com/yourname/tropify-slow-sound-garden"
            target="_blank"
            rel="noreferrer"
            className="hover:text-neutral-200"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}