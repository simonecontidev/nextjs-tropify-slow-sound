import Link from "next/link";
import Breathing from "@/components/Breathing";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto max-w-3xl px-6 pt-28 text-center">
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
          Tropify — the slow sound garden
        </h1>
        <p className="mt-4 text-neutral-300">
          Enter. Breathe. Let sound grow slowly.
        </p>

        <div className="mt-6">
          <Link
            href="/moment"
            className="inline-flex items-center rounded-full border border-neutral-800/60 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-700"
          >
            Choose a Moment →
          </Link>
        </div>
      </section>

      <Breathing />

      <footer className="pb-16 text-center text-sm text-neutral-500">
        Press &amp; hold, tap softly, or simply be still.
      </footer>
    </main>
  );
}