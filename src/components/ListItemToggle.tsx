"use client";

import { useOptimistic, useTransition } from "react";
import { toggleItem } from "@/app/lists-actions";

type Props = {
  listId: string;
  itemId: string;
  text: string;
  done: boolean;
  /** Shown on the homepage band, omitted on the list page where it is noise. */
  who?: string;
};

/**
 * Ticking an item off.
 *
 * The tick is applied optimistically and the write happens behind it. Without
 * that, the box only moves once a round trip to blob storage, a rewrite of the
 * whole document and a revalidation have all completed — about two seconds on
 * a deployed instance, which makes the control feel broken and invites a
 * second click on something that already worked.
 *
 * If the write fails the value snaps back, because the optimistic state is
 * derived from the prop and React discards it when the transition ends.
 */
export function ListItemToggle({ listId, itemId, text, done, who }: Props) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(done);

  return (
    <li className={shown ? "done" : undefined}>
      <button
        type="button"
        className="itemtoggle"
        aria-pressed={shown}
        aria-label={shown ? `Mark ${text} as not done` : `Mark ${text} as done`}
        onClick={() =>
          startTransition(async () => {
            setShown(!shown);
            await toggleItem(listId, itemId);
          })
        }
        // Not disabled while pending: the optimistic value has already moved,
        // and disabling would make a fast second tick impossible.
        data-pending={pending || undefined}
      >
        <span className="box" aria-hidden="true">
          {shown ? "✓" : ""}
        </span>
        <span className="txt">{text}</span>
        {who && <span className="who">{who}</span>}
      </button>
    </li>
  );
}
