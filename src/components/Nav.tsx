import Link from "next/link";

const links = [
  { href: "/timeline", label: "Timeline" },
  { href: "/gallery", label: "Gallery" },
  { href: "/trips", label: "Trips" },
];

export function Nav() {
  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-10">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-xl italic text-[var(--color-terracotta)]"
      >
        Us
      </Link>
      <nav className="flex items-center gap-6 text-sm text-[var(--color-ink-soft)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-[var(--color-terracotta)]"
          >
            {link.label}
          </Link>
        ))}
        <form action="/logout" method="post">
          <button
            type="submit"
            className="text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            Log out
          </button>
        </form>
      </nav>
    </header>
  );
}
