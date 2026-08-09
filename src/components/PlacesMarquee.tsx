import Link from "next/link";

type Props = {
  places: readonly string[];
};

export function PlacesMarquee({ places }: Props) {
  return (
    <Link
      href="/trips"
      aria-label={`Trips: ${places.join(", ")}`}
      className="marquee group relative block overflow-hidden py-10"
    >
      {/* Fades in and out at both ends rather than stopping at an edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--paper), transparent 12%, transparent 88%, var(--paper))",
        }}
      />

      <div className="marquee__track flex w-max gap-12 pr-12">
        {/* Duplicated so the loop has no visible seam. The copy is hidden
            from assistive tech; the link's aria-label carries the names. */}
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-12"
          >
            {places.map((place) => (
              <li
                key={place}
                className="flex items-center gap-12 font-[family-name:var(--font-display)] text-[length:var(--text-title)] font-semibold text-[var(--color-ink-soft)] transition-colors duration-[var(--duration-quick)] group-hover:text-[var(--color-rose)]"
              >
                {place}
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-coral)]"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Link>
  );
}
