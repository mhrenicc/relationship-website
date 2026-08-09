"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { Photo } from "@/lib/site-config";

type Props = {
  photos: Photo[];
};

/** Fixed, not random, so the server and client render the same pile. */
const TILTS = [-2.5, 1.8, -1.2, 3.1, -3.4, 2.2, -0.8];
const NUDGE = [
  [0, 0],
  [10, 6],
  [-8, 12],
  [14, 18],
  [-12, 22],
  [6, 26],
  [-4, 30],
];

export function PhotoStack({ photos }: Props) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [flicks, setFlicks] = useState(0);

  const flick = useCallback(() => {
    setOrder(([first, ...rest]) => [...rest, first]);
    setFlicks((n) => n + 1);
  }, []);

  const topPhoto = photos[order[0]];

  return (
    <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:gap-16">
      {/* Reversed so index 0 paints last and sits on top of the pile */}
      <div className="relative aspect-4/5 w-full max-w-sm shrink-0">
        {[...order].reverse().map((photoIndex, depthFromBack) => {
          const depth = order.length - 1 - depthFromBack;
          const [x, y] = NUDGE[depth % NUDGE.length];
          const isTop = depth === 0;

          return (
            <div
              key={photoIndex}
              aria-hidden={!isTop}
              className="absolute inset-0 bg-[var(--color-surface)] p-2 shadow-[0_18px_40px_-12px_oklch(0.08_0.02_145/0.85)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${
                  TILTS[depth % TILTS.length]
                }deg)`,
                zIndex: order.length - depth,
              }}
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={photos[photoIndex].src}
                  alt={isTop ? photos[photoIndex].alt : ""}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 100vw, 24rem"
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-[length:var(--text-title)] text-[var(--color-ink)]">
          The pile
        </h2>
        <p className="mt-3 max-w-[36ch] text-[length:var(--text-meta)] text-[var(--color-ink-muted)]">
          No order to it. Keep flicking and you will eventually hit the one with
          your eyes shut.
        </p>

        <button
          type="button"
          onClick={flick}
          className="mt-6 border border-[var(--color-line)] px-6 py-3 text-[length:var(--text-meta)] text-[var(--color-ink)] transition-[background-color,border-color,transform] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-[var(--color-lichen)] hover:bg-[var(--color-surface)] focus-visible:border-[var(--color-lichen)] active:translate-y-px active:bg-[var(--color-surface-hi)]"
        >
          Next one
        </button>

        <p aria-live="polite" className="sr-only">
          {flicks > 0 ? topPhoto.alt : ""}
        </p>
      </div>
    </div>
  );
}
