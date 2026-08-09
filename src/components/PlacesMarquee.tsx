import Link from "next/link";

type Props = {
  places: readonly string[];
};

export function PlacesMarquee({ places }: Props) {
  return (
    <Link
      href="/trips"
      aria-label={`Trips: ${places.join(", ")}`}
      className="marquee group block overflow-hidden border-y border-[var(--color-line)] py-8"
    >
      <div className="marquee__track flex w-max gap-10 pr-10">
        {/* Duplicated so the loop has no visible seam. The copy is hidden
            from assistive tech; the link's aria-label carries the names. */}
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-10"
          >
            {places.map((place) => (
              <li
                key={place}
                className="font-[family-name:var(--font-serif)] text-[length:var(--text-title)] font-light text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] group-hover:text-[var(--color-ink)]"
              >
                {place}
                <span aria-hidden className="ml-10 text-[var(--color-moss)]">
                  &bull;
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Link>
  );
}
