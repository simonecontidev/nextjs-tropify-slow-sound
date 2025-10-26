import { MOMENTS } from "@/data/moments";
import MomentCard from "@/components/MomentCard";

export default function MomentPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto max-w-4xl px-6 pt-24">
        <header className="text-center">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
            Choose a Moment
          </h1>
          <p className="mt-3 text-neutral-300">
            Four gentle scenes to enter slowly. No rush.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {MOMENTS.map((m, i) => (
            <MomentCard key={m.slug} moment={m} delay={i * 0.06} />
          ))}
        </div>
      </section>
    </main>
  );
}