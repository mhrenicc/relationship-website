"use client";

import { useActionState } from "react";
import { addTrip, type TripState } from "@/app/trips-actions";

const label = "mb-2 block font-medium text-[var(--color-ink)]";
const field =
  "w-full rounded-[var(--radius)] border border-[var(--color-bone-2)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] focus-visible:border-[var(--color-violet)] focus-visible:shadow-[0_0_0_3px_var(--wash-violet)]";

/**
 * A trip is a container you create first and add into afterwards, rather than
 * something derived from the dates on photographs. Photos join it from the
 * add form.
 */
export function TripForm() {
  const [state, formAction, isPending] = useActionState<TripState, FormData>(addTrip, {});

  return (
    <>
      <div aria-live="polite">
        {state.error && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-rose)] px-5 py-4 font-medium">
            {state.error}
          </p>
        )}
        {state.added && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-amber)] px-5 py-4 font-medium">
            Added &ldquo;{state.added}&rdquo;. Add photos to it from Add.
          </p>
        )}
      </div>

      <form key={state.added ?? "new"} action={formAction} className="flex flex-col gap-6">

        <div>
          <label htmlFor="places" className={label}>
            Where
          </label>
          <input
            id="places"
            name="places"
            required
            placeholder="Lisbon, Portugal"
            className={field}
          />
          <p className="mt-2 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
            What you will call it. Separate multiple stops with commas.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="start" className={label}>
              From
            </label>
            <input id="start" type="date" name="start" required className={field} />
          </div>
          <div>
            <label htmlFor="end" className={label}>
              Until
            </label>
            <input id="end" type="date" name="end" required className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="note" className={label}>
            Anything worth remembering <span className="font-normal">(optional)</span>
          </label>
          <input
            id="note"
            name="note"
            maxLength={300}
            placeholder="We got on the wrong ferry"
            className={field}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="grad-warm self-start rounded-full px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Add the trip"}
        </button>
      </form>
    </>
  );
}
