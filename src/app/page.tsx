import Image from "next/image";
import Link from "next/link";
import { LiveCounter } from "@/components/LiveCounter";
import { Nav } from "@/components/Nav";
import { PhotoStack } from "@/components/PhotoStack";
import { PlacesMarquee } from "@/components/PlacesMarquee";
import { Tally } from "@/components/Tally";
import { TimelineStrip } from "@/components/TimelineStrip";
import { daysTogether } from "@/lib/days-together";
import {
  heroPhoto,
  memoryPool,
  moments,
  places,
  sections,
  siteConfig,
  tallies,
} from "@/lib/site-config";

export default function Home() {
  const days = daysTogether(siteConfig.togetherSince);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-[var(--z-sticky)]">
        <Nav />
      </header>

      <main className="flex flex-1 flex-col">
        {/* The photograph is the design; the interface stays out of its way */}
        <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
          <Image
            src={heroPhoto.src}
            alt={heroPhoto.alt}
            fill
            priority
            sizes="100vw"
            className="settle object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-[var(--bg)]/70"
          />

          <div className="rise relative px-[var(--space-gutter)] pb-[clamp(3rem,2rem+5vw,7rem)]">
            <h1 className="max-w-[14ch] text-[length:var(--text-display)] text-[var(--color-ink)]">
              {siteConfig.partnerOne} and {siteConfig.partnerTwo}
            </h1>
            <div className="mt-6">
              <LiveCounter
                since={siteConfig.togetherSince}
                initialDays={days}
              />
            </div>
          </div>
        </section>

        <div className="py-[var(--space-movement)]">
          <TimelineStrip moments={moments} />
        </div>

        {/* A page of nothing but photographs gets monotonous. This breaks it. */}
        <section className="px-[var(--space-gutter)] pb-[var(--space-movement)]">
          <p className="max-w-[26ch] font-[family-name:var(--font-serif)] text-[length:var(--text-title)] font-light text-[var(--color-ink)]">
            Most of this is deeply unremarkable.
          </p>
          <p className="mt-6 max-w-[52ch] text-[length:var(--text-lead)] text-[var(--color-ink-muted)]">
            A Tuesday. A car park in the rain. An argument about directions that
            neither of us won and both of us still bring up. It is all in here,
            because that is most of what it actually was.
          </p>
        </section>

        <section className="px-[var(--space-gutter)] pb-[var(--space-movement)]">
          <PhotoStack photos={memoryPool} />
        </section>

        <section className="px-[var(--space-gutter)] pb-[var(--space-movement)]">
          <Tally entries={tallies} />
        </section>

        <div className="pb-[var(--space-movement)]">
          <PlacesMarquee places={places} />
        </div>

        <nav
          aria-label="Sections"
          className="border-t border-[var(--color-line)] px-[var(--space-gutter)]"
        >
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col gap-2 border-b border-[var(--color-line)] py-8 transition-[padding-left,background-color] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:bg-[var(--color-surface)] hover:pl-4 focus-visible:bg-[var(--color-surface)] active:bg-[var(--color-surface-hi)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <h2 className="text-[length:var(--text-title)] text-[var(--color-ink)]">
                {section.title}
              </h2>
              <p className="max-w-[44ch] text-[length:var(--text-meta)] text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] group-hover:text-[var(--color-ink)] sm:text-right">
                {section.blurb}
              </p>
            </Link>
          ))}
        </nav>
      </main>

      <footer className="px-[var(--space-gutter)] py-12 text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
        Ours, and nobody else&rsquo;s.
      </footer>
    </>
  );
}
