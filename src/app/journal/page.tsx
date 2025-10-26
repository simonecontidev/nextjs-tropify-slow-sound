// src/app/journal/page.tsx
import JournalViewer from "@/components/JournalViewer";

export default function JournalPage() {
  return (
    <main
      className="min-h-screen text-neutral-50"
      style={{ backgroundColor: "var(--page-bg)" }}
    >
      <section className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight">Journal</h1>
          <p className="text-sm text-neutral-400">Your quiet listening log</p>
        </div>

        <p className="mt-3 max-w-2xl text-neutral-300">
          Piccoli appunti automatici delle tue sessioni di ascolto. Un diario
          che cresce con il tuo ritmo.
        </p>

        <div className="mt-8">
          <JournalViewer />
        </div>
      </section>
    </main>
  );
}