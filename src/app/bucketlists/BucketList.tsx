"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addItem,
  deleteItem,
  deleteList,
  toggleItem,
  type ListState,
} from "@/app/lists-actions";
import { siteConfig } from "@/lib/site-config";
import type { StoredList } from "@/lib/storage";

const who = (id: "marko" | "partner") =>
  id === "marko" ? siteConfig.partnerOne : siteConfig.partnerTwo;

/**
 * One bucketlist, fully working: tick a line off, add a line, remove a line,
 * delete the whole thing.
 *
 * Ticking is optimistic-feeling rather than truly optimistic — the write
 * revalidates three routes, and a checkbox that waits for that reads as
 * broken. `useTransition` keeps the row responsive while it lands.
 */
export function BucketList({ list }: { list: StoredList }) {
  const [state, formAction, isAdding] = useActionState<ListState, FormData>(addItem, {});
  const [, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  const done = list.items.filter((item) => item.done).length;
  const total = list.items.length;

  return (
    <article className="bl">
      <header className="bl__head">
        <div>
          <h2>{list.name}</h2>
          <p className="bl__count">
            {total === 0 ? "Nothing on it yet" : `${done} of ${total} done`}
          </p>
        </div>

        {isConfirming ? (
          <span className="bl__ask">
            <button
              type="button"
              className="bl__yes"
              onClick={() => startTransition(() => void deleteList(list.id))}
            >
              Delete list
            </button>
            <button type="button" onClick={() => setIsConfirming(false)}>
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="bl__del"
            aria-label={`Delete ${list.name}`}
            onClick={() => setIsConfirming(true)}
          >
            ×
          </button>
        )}
      </header>

      {total > 0 && (
        <div className="bl__bar" aria-hidden="true">
          <span style={{ "--p": done / total } as React.CSSProperties} />
        </div>
      )}

      <ul className="bl__items">
        {list.items.map((item) => (
          <li key={item.id} className={item.done ? "done" : undefined}>
            <button
              type="button"
              className="bl__tick"
              aria-pressed={item.done}
              aria-label={item.done ? `Undo ${item.text}` : `Tick off ${item.text}`}
              onClick={() => startTransition(() => void toggleItem(list.id, item.id))}
            >
              <span className="bl__box" aria-hidden="true">
                {item.done ? "✓" : ""}
              </span>
              <span className="bl__txt">{item.text}</span>
              <span className="bl__who">{who(item.addedBy)}</span>
            </button>
            <button
              type="button"
              className="bl__x"
              aria-label={`Remove ${item.text}`}
              onClick={() => startTransition(() => void deleteItem(list.id, item.id))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Remounted on each success so the field clears itself. */}
      <form key={state.added ?? "new"} action={formAction} className="bl__add">
        <input type="hidden" name="listId" value={list.id} />
        <input
          name="text"
          required
          maxLength={140}
          placeholder="Add something to this list…"
          aria-label={`Add to ${list.name}`}
        />
        <select name="addedBy" aria-label="Who is adding this" defaultValue="marko">
          <option value="marko">{siteConfig.partnerOne}</option>
          <option value="partner">{siteConfig.partnerTwo}</option>
        </select>
        <button type="submit" disabled={isAdding}>
          {isAdding ? "…" : "Add"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="bl__err">
          {state.error}
        </p>
      )}
    </article>
  );
}
