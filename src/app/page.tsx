import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LiveCounter } from "@/components/LiveCounter";
import { Nav } from "@/components/Nav";
import { PhotoStack } from "@/components/PhotoStack";
import { PlacesMarquee } from "@/components/PlacesMarquee";
import { TimelineStrip } from "@/components/TimelineStrip";
import { daysTogether } from "@/lib/days-together";
import { getFeedSets } from "@/lib/moments";
import {
  heroPhoto,
  memoryPool,
  moments as placeholderMoments,
  places,
  sections,
  siteConfig,
} from "@/lib/site-config";

const TINTS = ["violet", "rose", "coral"] as const;

export default async function Home() {
  const days = daysTogether(siteConfig.togetherSince);
  const { sets, isPlaceholder } = await getFeedSets();

  // Adapter, not the destination. The homepage is being rebuilt around the
  // set feed; until that lands, the existing strip is fed a set's lead
  // photograph so real uploads are visible.
  const moments = isPlaceholder
    ? placeholderMoments
    : sets.map((set) => ({
        src: set.photos[0].urls.display,
        alt: set.photos[0].alt || set.caption,
        date: set.date,
        caption: set.caption,
      }));

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-[var(--z-sticky)]">
        <Nav onDark />
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative flex min-h-[88vh] flex-col justify-end overflow-hidden">
          <Image
            src={heroPhoto.src}
            alt={heroPhoto.alt}
            fill
            priority
            sizes="100vw"
            className="settle object-cover"
          />
          {/* Top stays dark for the nav; the base melts into the page colour */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.2 0.04 320 / 0.6), oklch(0.2 0.04 320 / 0.15) 38%, oklch(0.2 0.04 320 / 0.55) 72%, var(--paper))",
            }}
          />

          <div className="rise relative px-[var(--space-gutter)] pb-[clamp(3rem,2rem+5vw,6rem)]">
            <h1 className="max-w-[14ch] text-[length:var(--text-display)] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
              {siteConfig.partnerOne} and {siteConfig.partnerTwo}
            </h1>
            <div className="mt-6 inline-block rounded-full bg-white/95 px-5 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <LiveCounter since={siteConfig.togetherSince} initialDays={days} />
            </div>
          </div>
        </section>

        <div className="pb-[var(--space-movement)] pt-[clamp(3rem,2rem+4vw,6rem)]">
          <TimelineStrip moments={moments} />
        </div>

        {/* A page of nothing but photographs gets monotonous. This breaks it. */}
        <section
          style={{ "--wash-tint": "var(--wash-violet)" } as CSSProperties}
          className="wash px-[var(--space-gutter)] py-[clamp(4rem,3rem+5vw,7rem)]"
        >
          <p className="max-w-[18ch] font-[family-name:var(--font-display)] text-[length:var(--text-display)] font-semibold leading-[0.98]">
            Most of this is deeply unremarkable.
          </p>
          <p className="mt-8 max-w-[52ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
            A Tuesday. A car park in the rain. An argument about directions that
            neither of us won and both of us still bring up. It is all in here,
            because that is most of what it actually was.
          </p>
        </section>

        <section className="px-[var(--space-gutter)] py-[var(--space-movement)]">
          <PhotoStack photos={memoryPool} />
        </section>

        <PlacesMarquee places={places} />

        <nav
          aria-label="Sections"
          className="grid gap-6 px-[var(--space-gutter)] py-[var(--space-movement)] sm:grid-cols-3"
        >
          {sections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              style={
                {
                  "--wash-tint": `var(--wash-${TINTS[index % TINTS.length]})`,
                } as CSSProperties
              }
              className="group rounded-[var(--radius-lg)] bg-[var(--wash-tint)] p-8 shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <h2 className="text-[length:var(--text-title)]">
                {section.title}
                <span
                  aria-hidden
                  className="ml-2 inline-block text-[var(--color-rose)] transition-transform duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
                >
                  &rarr;
                </span>
              </h2>
              <p className="mt-3 max-w-[34ch] text-[var(--color-ink-soft)]">
                {section.blurb}
              </p>
            </Link>
          ))}
        </nav>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-[var(--space-gutter)] pb-12 text-[var(--color-ink-soft)]">
        <span>Ours, and nobody else&rsquo;s.</span>
        <Link
          href="/add"
          className="font-medium text-[var(--color-rose)] underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-violet)] hover:underline"
        >
          Add something
        </Link>
      </footer>
    </>
  );
}
