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
      </section>

      <Breathing />

      <footer className="pb-16 text-center text-sm text-neutral-500">
        Press &amp; hold, tap softly, or simply be still.
      </footer>
    </main>
  );
}