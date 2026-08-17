"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addMoment, deleteMoment, type MomentState } from "@/app/milestones-actions";
import type { StoredMilestone } from "@/lib/storage";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

/**
 * Adding to the ribbon, from a panel in the corner rather than a page.
 *
 * A moment is two short fields and a toggle. Routing to a whole screen for
 * that is more navigation than the thing is worth, and the ribbon is meant to
 * stay something you look at rather than a surface you administer.
 */
export function MomentAdd({ moments }: { moments: StoredMilestone[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<MomentState, FormData>(addMoment, {});
  const [, startTransition] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Escape closes and returns focus to the trigger, so a keyboard user is not
  // stranded at the end of the document.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  // Real moments only: the placeholders on an empty ribbon are not his and
  // cannot be deleted, so offering the control would be a dead end.
  const real = moments.filter((moment) => !moment.id.startsWith("p-ms-"));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="momentopen"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        Add to timeline
      </button>

      {isOpen && (
        <div className="momentpanel" ref={panel} role="dialog" aria-label="Add a moment">
          <div className="momentpanel__head">
            <b>A moment</b>
            <button type="button" aria-label="Close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div aria-live="polite">
            {state.error && <p className="momentpanel__err">{state.error}</p>}
            {state.added && !state.error && (
              <p className="momentpanel__ok">Added &ldquo;{state.added}&rdquo;.</p>
            )}
          </div>

          {/* Remounted on each success so the fields clear themselves. */}
          <form key={state.added ?? "new"} action={formAction} className="momentform">
            <label htmlFor="moment-text">What happened</label>
            <input
              id="moment-text"
              name="text"
              required
              maxLength={60}
              autoFocus
              placeholder="First kiss"
            />

            <label htmlFor="moment-date">When</label>
            <input id="moment-date" type="date" name="date" required defaultValue={today} />

            <label className="momentform__toggle">
              {/* The hidden companion makes "off" distinguishable from a field
                  that was never rendered — an unticked box sends nothing. */}
              <input type="hidden" name="significant" value="off" />
              <input type="checkbox" name="significant" value="on" />
              <span>
                Significant
                <em>Always shows its name. Otherwise it is a dot you hover.</em>
              </span>
            </label>

            <button type="submit" disabled={isPending}>
              {isPending ? "Adding…" : "Add it"}
            </button>
          </form>

          {real.length > 0 && (
            <ul className="momentlist">
              {real.map((moment) => (
                <li key={moment.id}>
                  <span className={moment.significant ? "momentlist__big" : undefined}>
                    {moment.text}
                    <em>{formatDate(moment.date)}</em>
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${moment.text}`}
                    onClick={() => startTransition(() => void deleteMoment(moment.id))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
