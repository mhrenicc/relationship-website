import Link from "next/link";

type Props = {
  href: string;
  title: string;
  description: string;
  eyebrow: string;
};

export function SectionCard({ href, title, description, eyebrow }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(184,72,31,0.35)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-rose)] opacity-0 blur-2xl transition-opacity duration-[var(--duration-normal)] group-hover:opacity-30"
      />
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {eyebrow}
        </p>
        <h3 className="mb-3 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {description}
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-terracotta)]">
        Open
        <span className="transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
