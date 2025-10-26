import Link from "next/link";
import { notFound } from "next/navigation";
import { MOMENTS, getMoment, type Moment } from "@/data/moments";

type Props = {
  params: { slug: Moment["slug"] };
};

export async function generateStaticParams() {
  return MOMENTS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: Props) {
  const moment = getMoment(params.slug);
  return {
    title: moment
      ? `${moment.title} — Tropify`
      : "Tropify — The Slow Sound Garden",
  };
}

export default function PlayPage({ params }: Props) {
  const moment = getMoment(params.slug);
  if (!moment) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto max-w-3xl px-6 pt-24">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight">
            {moment.title}
          </h1>
          <Link
            href="/moment"
            className="rounded-full border border-neutral-800/60 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-700"
          >
            ← Moments
          </Link>
        </div>
        <p className="mt-2 text-neutral-300">{moment.subtitle}</p>

        {/* Placeholder player: i controlli verranno collegati all'audio engine */}
        <div className="mt-8 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              disabled
              aria-disabled="true"
              title="Coming soon"
            >
              ▶︎ Play
            </button>
            <button
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              disabled
              aria-disabled="true"
              title="Coming soon"
            >
              ❚❚ Pause
            </button>
            <span className="ml-2 text-xs text-neutral-500">
              (audio engine coming next)
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}