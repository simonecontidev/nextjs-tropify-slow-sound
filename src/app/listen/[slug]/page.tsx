import Link from "next/link";
import { notFound } from "next/navigation";
import { MOMENTS, getMoment, type Moment } from "@/data/moments";
import ClientPlayerControls from "@/components/ClientPlayerControls";
import ZenVisualizer from "@/components/ZenVisualizer";
import MoodSliders from "@/components/MoodSliders";
import MoodBadge from "@/components/MoodBadge";


// Pre-render (ok anche su Next 15)
export async function generateStaticParams() {
  return MOMENTS.map((m) => ({ slug: m.slug }));
}

// Anche qui: params è una Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: Moment["slug"] }>;
}) {
  const { slug } = await params;
  const m = getMoment(slug);
  return {
    title: m ? `${m.title} — Tropify` : "Tropify — The Slow Sound Garden",
    description: m?.subtitle ?? "A serene, tropical slow-sound experience.",
  };
}

export default async function ListenPage({
  params,
}: {
  params: Promise<{ slug: Moment["slug"] }>;
}) {
  const { slug } = await params; 
  const moment = getMoment(slug);
  if (!moment) return notFound();

  return (
    <main className="min-h-screen text-neutral-50" style={{ backgroundColor: "var(--page-bg)" }}>
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
          <ClientPlayerControls slug={slug} />
           <MoodBadge />
            <MoodSliders /> 
          <ZenVisualizer />
        </div>
      </section>
    </main>
  );
}