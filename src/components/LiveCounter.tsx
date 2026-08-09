"use client";

import { useEffect, useState } from "react";
import { elapsedSince, type Elapsed } from "@/lib/elapsed";

type Props = {
  since: string;
  /** Computed on the server so the first paint matches and hydration stays clean. */
  initialDays: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function LiveCounter({ since, initialDays }: Props) {
  const [elapsed, setElapsed] = useState<Elapsed | null>(null);

  useEffect(() => {
    // Only starts after mount, so the server and client agree on first paint.
    const tick = () => setElapsed(elapsedSince(since));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since]);

  return (
    <p className="text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
      <span className="text-[var(--color-ink)]">
        {(elapsed?.days ?? initialDays).toLocaleString()}
      </span>{" "}
      days
      {elapsed && (
        <>
          <span aria-hidden>
            {" "}
            · {pad(elapsed.hours)}:{pad(elapsed.minutes)}:{pad(elapsed.seconds)}
          </span>
          <span className="sr-only">
            , {elapsed.hours} hours, {elapsed.minutes} minutes and{" "}
            {elapsed.seconds} seconds
          </span>
        </>
      )}
      , kept here
    </p>
  );
}
