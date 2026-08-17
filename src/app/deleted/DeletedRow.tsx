"use client";

import { useState, useTransition } from "react";

type Props = {
  title: string;
  detail: string;
  when: string;
  thumb?: string;
  onRestore: () => Promise<void>;
  onPurge: () => Promise<void>;
};

/**
 * One deleted thing, with the way back and the way out.
 *
 * Purging asks twice and says what it means, because this is the only control
 * on the site that destroys something permanently.
 */
export function DeletedRow({ title, detail, when, thumb, onRestore, onPurge }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      setIsConfirming(false);
    });
  };

  return (
    <li className="flex items-center gap-4 rounded-[var(--radius)] bg-white/70 p-4 shadow-[var(--shadow-soft)]">
      <div className="size-16 shrink-0 overflow-hidden rounded-[0.75rem] bg-[var(--color-wash-violet)]">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set
          <img src={thumb} alt="" className="size-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
          {detail}
        </p>
        <p className="text-[length:var(--text-meta)] text-[var(--color-ink-soft)] opacity-80">
          Deleted {when}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isConfirming ? (
          <>
            <span className="text-[length:var(--text-meta)] font-semibold">Forever?</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(onPurge)}
              className="rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-white transition-[filter] duration-[var(--duration-quick)] hover:brightness-110 disabled:opacity-60"
            >
              {isPending ? "…" : "Erase"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsConfirming(false)}
              className="rounded-full bg-[var(--color-wash-violet)] px-4 py-2 text-sm font-semibold transition-colors duration-[var(--duration-quick)] hover:bg-[var(--color-wash-rose)]"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(onRestore)}
              className="rounded-full bg-[var(--color-wash-amber)] px-4 py-2 text-sm font-semibold transition-[transform,background-color] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-[var(--color-amber)] disabled:opacity-60"
            >
              {isPending ? "…" : "Put it back"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] underline decoration-dotted underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:text-[var(--color-rose)]"
            >
              Erase
            </button>
          </>
        )}
      </div>
    </li>
  );
}
