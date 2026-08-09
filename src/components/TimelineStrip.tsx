import Image from "next/image";
import Link from "next/link";
import type { Moment } from "@/lib/site-config";

type Props = {
  moments: Moment[];
};

// Fixed locale so server and client format identically.
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export function TimelineStrip({ moments }: Props) {
  const ordered = [...moments].reverse();

  return (
    <section aria-labelledby="recent-heading">
      <div className="flex items-baseline justify-between gap-6 px-[var(--space-gutter)]">
        <h2
          id="recent-heading"
          className="text-[length:var(--text-title)] text-[var(--color-ink)]"
        >
          Lately
        </h2>
        <Link
          href="/timeline"
          className="shrink-0 text-[length:var(--text-meta)] text-[var(--color-ink-muted)] underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-ink)] hover:underline active:text-[var(--color-lichen)]"
        >
          See the whole timeline
        </Link>
      </div>

      {/* tabIndex makes the overflow container keyboard-scrollable */}
      <div
        role="region"
        aria-label="Recent moments, scrollable"
        tabIndex={0}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--space-gutter)] pb-4 [scrollbar-width:thin]"
      >
        {ordered.map((moment) => (
          <figure
            key={moment.date}
            className="group/moment w-[68vw] shrink-0 snap-start sm:w-[22rem]"
          >
            {/* Lifts and straightens on hover, like picking one up off the table */}
            <div className="relative aspect-3/2 origin-bottom overflow-hidden bg-[var(--color-surface)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/moment:-translate-y-2 group-hover/moment:rotate-[-1.2deg]">
              <Image
                src={moment.src}
                alt={moment.alt}
                fill
                loading="eager"
                sizes="(max-width: 640px) 68vw, 22rem"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3">
              <time
                dateTime={moment.date}
                className="text-[length:var(--text-meta)] text-[var(--color-ink-muted)]"
              >
                {formatDate(moment.date)}
              </time>
              <p className="mt-1 font-[family-name:var(--font-serif)] text-[length:var(--text-lead)] font-light text-[var(--color-ink)]">
                {moment.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
