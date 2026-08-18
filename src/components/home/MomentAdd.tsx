"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addMoment,
  deleteMoment,
  updateMoment,
  type MomentState,
} from "@/app/milestones-actions";
import { formatMoment, toMonthValue } from "@/lib/moment-date";
import type { StoredMilestone } from "@/lib/storage";

/**
 * Adding to the ribbon, from a panel in the corner rather than a page.
 *
 * A moment is two short fields and a toggle. Routing to a whole screen for
 * that is more navigation than the thing is worth, and the ribbon is meant to
 * stay something you look at rather than a surface you administer.
 */
export function MomentAdd({ moments }: { moments: StoredMilestone[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [monthOnly, setMonthOnly] = useState(false);
  const [state, formAction, isPending] = useActionState<MomentState, FormData>(addMoment, {});
  const [editState, editAction, isSaving] = useActionState<MomentState, FormData>(
    updateMoment,
    {},
  );
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

  // The ribbon marks are far away in the tree; they announce an edit rather
  // than the page threading state down to both.
  useEffect(() => {
    const onEdit = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const found = moments.find((moment) => moment.id === id);
      if (!found) return;
      setEditingId(id);
      setMonthOnly(found.precision === "month");
      setIsOpen(true);
    };
    window.addEventListener("moment:edit", onEdit);
    return () => window.removeEventListener("moment:edit", onEdit);
  }, [moments]);

  const editing = editingId ? moments.find((moment) => moment.id === editingId) : undefined;
  const shown = editing ? editState : state;

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
            <b>{editing ? "This moment" : "A moment"}</b>
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setIsOpen(false);
                setEditingId(null);
              }}
            >
              ×
            </button>
          </div>

          <div aria-live="polite">
            {shown.error && <p className="momentpanel__err">{shown.error}</p>}
            {shown.added && !shown.error && (
              <p className="momentpanel__ok">Added &ldquo;{shown.added}&rdquo;.</p>
            )}
            {shown.saved && !shown.error && (
              <p className="momentpanel__ok">Saved &ldquo;{shown.saved}&rdquo;.</p>
            )}
          </div>

          {/* Remounted on each success, and whenever the moment being edited
              changes, so the fields carry the right values. */}
          <form
            key={editing?.id ?? state.added ?? "new"}
            action={editing ? editAction : formAction}
            className="momentform"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <label htmlFor="moment-text">What happened</label>
            <input
              id="moment-text"
              name="text"
              required
              maxLength={60}
              autoFocus
              placeholder="First kiss"
              defaultValue={editing?.text ?? ""}
            />

            <label htmlFor="moment-date">When</label>
            {/* Two inputs rather than one that changes type: React keeps the
                old value when only `type` changes, and a day value in a month
                field is silently dropped. */}
            {monthOnly ? (
              <input
                id="moment-date"
                type="month"
                name="date"
                required
                defaultValue={editing ? toMonthValue(editing.date) : today.slice(0, 7)}
              />
            ) : (
              <input
                id="moment-date"
                type="date"
                name="date"
                required
                defaultValue={editing?.date ?? today}
              />
            )}
            <input type="hidden" name="precision" value={monthOnly ? "month" : "day"} />

            <label className="momentform__toggle">
              <input
                type="checkbox"
                checked={monthOnly}
                onChange={(event) => setMonthOnly(event.target.checked)}
              />
              <span>
                Only the month
                <em>For a trip over a few days, or when the day is long gone.</em>
              </span>
            </label>

            <label className="momentform__toggle">
              {/* The hidden companion makes "off" distinguishable from a field
                  that was never rendered — an unticked box sends nothing. */}
              <input type="hidden" name="significant" value="off" />
              <input
                type="checkbox"
                name="significant"
                value="on"
                defaultChecked={editing?.significant ?? false}
              />
              <span>
                Significant
                <em>Always shows its name. Otherwise it is a dot you hover.</em>
              </span>
            </label>

            <div className="momentform__actions">
              <button type="submit" disabled={isPending || isSaving}>
                {editing
                  ? isSaving
                    ? "Saving…"
                    : "Save"
                  : isPending
                    ? "Adding…"
                    : "Add it"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="momentform__cancel"
                  onClick={() => {
                    setEditingId(null);
                    setMonthOnly(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {real.length > 0 && (
            <ul className="momentlist">
              {real.map((moment) => (
                <li key={moment.id}>
                  <span className={moment.significant ? "momentlist__big" : undefined}>
                    {moment.text}
                    <em>{formatMoment(moment)}</em>
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
