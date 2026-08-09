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
      <div className="flex flex-wrap items-baseline justify-between gap-4 px-[var(--space-gutter)]">
        <h2 id="recent-heading" className="text-[length:var(--text-title)]">
          Lately
        </h2>
        <Link
          href="/timeline"
          className="shrink-0 font-medium text-[var(--color-rose)] underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-violet)] hover:underline"
        >
          See the whole timeline
        </Link>
      </div>

      {/* tabIndex makes the overflow container keyboard-scrollable */}
      <div
        role="region"
        aria-label="Recent moments, scrollable"
        tabIndex={0}
        className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--space-gutter)] pb-8 pt-2"
      >
        {ordered.map((moment, index) => (
          <figure
            key={`${moment.date}-${index}`}
            className="group/moment w-[74vw] shrink-0 snap-start sm:w-[23rem]"
          >
            <div className="relative aspect-3/2 overflow-hidden rounded-[var(--radius)] bg-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] group-hover/moment:-translate-y-1.5 group-hover/moment:shadow-[var(--shadow-lift)]">
              <Image
                src={moment.src}
                alt={moment.alt}
                fill
                loading="eager"
                sizes="(max-width: 640px) 74vw, 23rem"
                className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/moment:scale-[1.03]"
              />
            </div>
            <figcaption className="mt-4">
              <time
                dateTime={moment.date}
                className="text-[length:var(--text-meta)] font-medium text-[var(--color-ink-soft)]"
              >
                {formatDate(moment.date)}
              </time>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug">
                {moment.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
