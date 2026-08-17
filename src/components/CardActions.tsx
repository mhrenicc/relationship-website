"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type Props = {
  /** Where the edit form lives. */
  editHref: string;
  /** A bound server action — `deleteSet.bind(null, id)`. */
  onDelete: () => Promise<void>;
  /** Named in the confirmation, so "Delete the trip?" reads as itself. */
  what: string;
};

/**
 * Edit and delete on a card, without a browser `confirm()`.
 *
 * The confirmation is a second click on the same control rather than a dialog:
 * a native confirm cannot be styled, drops the reader out of the page, and is
 * suppressed outright in some embedded browsers, which would make deleting
 * silently impossible.
 *
 * The cluster stays hidden until the card is hovered or something inside it
 * takes focus — management controls on every card at all times turn a wall of
 * photographs into an admin panel. `:focus-within` keeps it reachable by
 * keyboard, and coarse pointers get it permanently since they cannot hover.
 */
export function CardActions({ editHref, onDelete, what }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isConfirming) {
    return (
      <div className="cardacts cardacts--confirm" role="group" aria-label={`Delete this ${what}?`}>
        <span className="cardacts__ask">Delete?</span>
        <button
          type="button"
          className="cardacts__btn cardacts__btn--yes"
          disabled={isPending}
          onClick={() => startTransition(async () => { await onDelete(); })}
        >
          {isPending ? "…" : "Yes"}
        </button>
        <button
          type="button"
          className="cardacts__btn"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <div className="cardacts">
      <Link className="cardacts__btn" href={editHref}>
        Edit
      </Link>
      <button
        type="button"
        className="cardacts__btn"
        onClick={() => setIsConfirming(true)}
        aria-label={`Delete this ${what}`}
      >
        Delete
      </button>
    </div>
  );
}
