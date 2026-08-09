import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { daysTogether } from "@/lib/days-together";
import { heroPhoto, sections, siteConfig } from "@/lib/site-config";

/**
 * Photos are sized by significance rather than dropped into equal tiles.
 * An even grid would read as an Instagram feed, which is an explicit
 * anti-reference for this project.
 */
const shapes = [
  "sm:col-span-7 aspect-4/5",
  "sm:col-span-5 sm:mt-32 aspect-3/4",
  "sm:col-span-12 aspect-21/9",
];

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
            <p className="mt-6 text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
              {days.toLocaleString()} days, kept here
            </p>
          </div>
        </section>

        <section
          aria-label="Sections"
          className="grid grid-cols-1 gap-[var(--space-gutter)] px-[var(--space-gutter)] py-[var(--space-movement)] sm:grid-cols-12"
        >
          {sections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              className={`group relative block overflow-hidden ${shapes[index]}`}
            >
              {/* Eager: these three are the primary navigation, not incidental
                  decoration, so they must not pop in after the fold. */}
              <Image
                src={section.photo.src}
                alt={section.photo.alt}
                fill
                loading="eager"
                sizes="(max-width: 640px) 100vw, 60vw"
                className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-transparent to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-[clamp(1.25rem,1rem+1.5vw,2.5rem)]">
                <h2 className="text-[length:var(--text-title)] text-[var(--color-ink)]">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-[38ch] text-[length:var(--text-meta)] text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] group-hover:text-[var(--color-ink)]">
                  {section.blurb}
                </p>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <footer className="px-[var(--space-gutter)] pb-10 text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
        Ours, and nobody else&rsquo;s.
      </footer>
    </>
  );
}
