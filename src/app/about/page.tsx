// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <main
      className="min-h-screen text-neutral-50"
      style={{ backgroundColor: "var(--page-bg)" }}
    >
      <section className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">About — Tropify</h1>
        <p className="mt-4 max-w-2xl text-neutral-300">
          Tropify è un piccolo santuario sonoro: un’interfaccia minimale che
          respira con te. Nessuna corsa, nessuno skip — solo momenti lenti.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800/60 bg-black/20 p-5">
            <h2 className="text-lg font-medium">Concept</h2>
            <p className="mt-2 text-neutral-300">
              Un “giardino” di paesaggi tropicali astratti. Il suono guida il respiro,
              i colori seguono il tuo umore (Intensity/Calm/Nature), la UI scompare.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/60 bg-black/20 p-5">
            <h2 className="text-lg font-medium">Stack</h2>
            <ul className="mt-2 space-y-1 text-neutral-300">
              <li>• Next.js (App Router) + TypeScript</li>
              <li>• TailwindCSS per una UI pulita</li>
              <li>• GSAP + Canvas 2D per il visualizer</li>
              <li>• Web Audio API (Gain, Biquad, Analyser)</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-800/60 bg-black/20 p-5">
          <h2 className="text-lg font-medium">Manifesto</h2>
          <p className="mt-2 text-neutral-300">
            Tropify non è un player: è un rito. Non accelera: rallenta.
            Coltiva un ritmo gentile. Respira, ascolta, rimani.
          </p>
        </div>
      </section>
    </main>
  );
}