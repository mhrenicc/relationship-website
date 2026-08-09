import { Nav } from "@/components/Nav";
import { SectionCard } from "@/components/SectionCard";
import { daysTogether } from "@/lib/days-together";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  const days = daysTogether(siteConfig.togetherSince);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Nav />

      <main className="flex flex-1 flex-col px-6 sm:px-10">
        <section className="flex flex-col items-start gap-6 py-[var(--space-section)]">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--color-gold)]">
            {siteConfig.partnerOne} &amp; {siteConfig.partnerTwo}
          </p>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-[var(--text-hero)] leading-[0.95] text-[var(--color-ink)]">
            {siteConfig.tagline}
          </h1>
          <p className="text-[var(--text-lg)] text-[var(--color-ink-soft)]">
            <span className="font-[family-name:var(--font-display)] italic text-[var(--color-terracotta)]">
              {days.toLocaleString()}
            </span>{" "}
            days and counting.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 pb-[var(--space-section)] sm:grid-cols-3">
          <SectionCard
            href="/timeline"
            eyebrow="Our story"
            title="Timeline"
            description="Every milestone, from the first hello to whatever's next."
          />
          <SectionCard
            href="/gallery"
            eyebrow="Photos"
            title="Gallery"
            description="The pictures worth keeping, all in one place."
          />
          <SectionCard
            href="/trips"
            eyebrow="Adventures"
            title="Trips"
            description="Everywhere we've been, and everywhere we're going."
          />
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-[var(--color-ink-soft)] sm:px-10">
        made with us, for us.
      </footer>
    </div>
  );
}
