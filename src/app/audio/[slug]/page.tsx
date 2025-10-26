import Link from "next/link";
import { notFound } from "next/navigation";
import { MOMENTS, getMoment, type Moment } from "@/data/moments";
import ClientPlayerControls from "@/components/ClientPlayerControls";

export async function generateStaticParams() {
  return MOMENTS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: Moment["slug"] } }) {
  const m = getMoment(params.slug);
  const title = m ? `${m.title} — Tropify` : "Tropify — The Slow Sound Garden";
  const description = m?.subtitle ?? "A serene, tropical slow-sound experience.";
  return { title, description };
}

export default function AudioPage({ params }: { params: { slug: Moment["slug"] } }) {
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

        <div className="mt-8 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-5">
          <ClientPlayerControls slug={params.slug} />
        </div>
      </section>
    </main>
  );
}