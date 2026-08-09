import Link from "next/link";

const links = [
  { href: "/timeline", label: "Timeline" },
  { href: "/gallery", label: "Gallery" },
  { href: "/trips", label: "Trips" },
];

export function Nav() {
  return (
    <nav
      aria-label="Main"
      className="flex items-center justify-between gap-6 px-[var(--space-gutter)] py-6"
    >
      <Link
        href="/"
        className="font-[family-name:var(--font-serif)] text-lg font-light italic text-[var(--color-ink)]"
      >
        Us
      </Link>

      <div className="flex items-center gap-5 text-[length:var(--text-meta)] sm:gap-7">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-ink)]"
          >
            {link.label}
          </Link>
        ))}
        <form action="/logout" method="post" className="flex">
          <button
            type="submit"
            className="text-[var(--color-ink-muted)] transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-ink)]"
          >
            Lock
          </button>
        </form>
      </div>
    </nav>
  );
}
