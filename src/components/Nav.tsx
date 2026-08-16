import Link from "next/link";

const links = [
  { href: "/gallery", label: "Gallery" },
  { href: "/trips", label: "Trips" },
];

type Props = {
  /** The hero is a photo, so the nav flips to light type over it. */
  onDark?: boolean;
};

export function Nav({ onDark = false }: Props) {
  const brand = onDark ? "text-white" : "text-[var(--color-ink)]";
  const muted = onDark ? "text-white/90" : "text-[var(--color-ink-soft)]";
  const hover = onDark ? "hover:text-white" : "hover:text-[var(--color-rose)]";

  return (
    <nav
      aria-label="Main"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[var(--space-gutter)] py-5"
    >
      <Link
        href="/"
        className={`font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight ${brand}`}
      >
        Us
      </Link>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[length:var(--text-meta)] font-medium">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${muted} ${hover} transition-colors duration-[var(--duration-quick)]`}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/add"
          className="grad-warm rounded-full px-5 py-2 font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-lift)] active:translate-y-0"
        >
          Add
        </Link>

        <form action="/logout" method="post" className="flex">
          <button
            type="submit"
            className={`${muted} ${hover} transition-colors duration-[var(--duration-quick)]`}
          >
            Lock
          </button>
        </form>
      </div>
    </nav>
  );
}
