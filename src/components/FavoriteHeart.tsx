"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavorite } from "@/app/sets-actions";

type Props = {
  setId: string;
  photoKey: string;
  isFavorite: boolean;
};

/**
 * The heart in the corner of a photograph.
 *
 * Optimistic, because the round trip revalidates four routes and a heart that
 * waits for that feels broken. If the write fails the value snaps back on the
 * next render, which is the right outcome for something this small.
 */
export function FavoriteHeart({ setId, photoKey, isFavorite }: Props) {
  const [shown, setShown] = useOptimistic(isFavorite);
  const [, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      setShown(!shown);
      await toggleFavorite(setId, photoKey);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={shown}
      aria-label={shown ? "Remove from favourites" : "Add to favourites"}
      title={shown ? "One of ours" : "Make this one of ours"}
      className={`heart ${shown ? "heart--on" : ""}`}
    >
      <span aria-hidden="true">{shown ? "♥" : "♡"}</span>
    </button>
  );
}
