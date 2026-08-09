"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { Photo } from "@/lib/site-config";

type Props = {
  photos: Photo[];
};

/** Fixed, not random, so the server and client render the same pile. */
const TILTS = [-2.5, 2, -1.4, 3.2, -3.4, 2.4, -0.9];
const NUDGE = [
  [0, 0],
  [10, 7],
  [-9, 13],
  [14, 19],
  [-12, 24],
  [7, 29],
  [-5, 33],
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
    <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:gap-16">
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
              className="absolute inset-0 overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-lift)] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${
                  TILTS[depth % TILTS.length]
                }deg)`,
                zIndex: order.length - depth,
              }}
            >
              <Image
                src={photos[photoIndex].src}
                alt={isTop ? photos[photoIndex].alt : ""}
                fill
                loading="eager"
                sizes="(max-width: 640px) 100vw, 24rem"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-[length:var(--text-title)]">The pile</h2>
        <p className="mt-4 max-w-[36ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          No order to it. Keep going and you will hit the one with your eyes
          shut.
        </p>

        <button
          type="button"
          onClick={flick}
          className="grad-warm mt-8 rounded-full px-8 py-4 font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-lift)] active:translate-y-0"
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
