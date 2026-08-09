import type { TallyEntry } from "@/lib/site-config";

type Props = {
  entries: readonly TallyEntry[];
};

export function Tally({ entries }: Props) {
  return (
    <section aria-labelledby="tally-heading">
      <h2
        id="tally-heading"
        className="text-[length:var(--text-title)] text-[var(--color-ink)]"
      >
        Running total
      </h2>

      <dl className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex items-baseline gap-4 border-b border-[var(--color-line)] py-4"
          >
            <dt className="order-2 max-w-[34ch] text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
              {entry.label}
            </dt>
            <dd className="order-1 w-14 shrink-0 font-[family-name:var(--font-serif)] text-3xl font-light text-[var(--color-lichen)] tabular-nums">
              {entry.count}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
