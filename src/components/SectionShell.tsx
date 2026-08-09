import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";

type Props = {
  title: string;
  intro: string;
  /** What will live here once there is content. Shown while the section is empty. */
  awaiting: string;
  children?: ReactNode;
};

export function SectionShell({ title, intro, awaiting, children }: Props) {
  const isEmpty = !children;

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="flex flex-1 flex-col px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(3rem,2rem+5vw,7rem)]">
        <h1 className="max-w-[16ch] text-[length:var(--text-display)] text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="mt-6 max-w-[52ch] text-[length:var(--text-lead)] text-[var(--color-ink-muted)]">
          {intro}
        </p>

        {isEmpty ? (
          <div className="mt-[clamp(3rem,2rem+4vw,6rem)] border-t border-[var(--line)] pt-8">
            <p className="max-w-[46ch] font-[family-name:var(--font-serif)] text-[length:var(--text-lead)] font-light italic text-[var(--color-ink-muted)]">
              {awaiting}
            </p>
          </div>
        ) : (
          <div className="mt-[clamp(3rem,2rem+4vw,6rem)]">{children}</div>
        )}
      </main>
    </>
  );
}
