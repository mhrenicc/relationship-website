import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Nav } from "@/components/Nav";

type Props = {
  title: string;
  intro: string;
  /** What will live here once there is content. Shown while the section is empty. */
  awaiting: string;
  tint: "violet" | "rose" | "coral" | "amber";
  children?: ReactNode;
};

export function SectionShell({ title, intro, awaiting, tint, children }: Props) {
  const isEmpty = !children;
  const washStyle = {
    "--wash-tint": `var(--wash-${tint})`,
  } as CSSProperties;

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="flex flex-1 flex-col">
        <div
          style={washStyle}
          className="wash px-[var(--space-gutter)] py-[clamp(2.5rem,2rem+4vw,5rem)]"
        >
          <h1 className="text-[length:var(--text-display)]">{title}</h1>
          <p className="mt-4 max-w-[52ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
            {intro}
          </p>
        </div>

        <div className="px-[var(--space-gutter)] pb-[var(--space-movement)] pt-4">
          {isEmpty ? (
            <div className="max-w-xl rounded-[var(--radius-lg)] bg-white/70 p-10 shadow-[var(--shadow-soft)]">
              <p className="text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
                {awaiting}
              </p>
              <Link
                href="/add"
                className="grad-warm mt-8 inline-block rounded-full px-7 py-3.5 font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-lift)] active:translate-y-0"
              >
                Add the first one
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </>
  );
}
