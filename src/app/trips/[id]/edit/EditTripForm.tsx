"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateTrip, type TripState } from "@/app/trips-actions";
import type { StoredTrip } from "@/lib/storage";

const label = "mb-2 block font-medium text-[var(--color-ink)]";
const field =
  "w-full rounded-[var(--radius)] border border-[var(--color-bone-2)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] focus-visible:border-[var(--color-violet)] focus-visible:shadow-[0_0_0_3px_var(--wash-violet)]";

export function EditTripForm({ trip }: { trip: StoredTrip }) {
  const [state, formAction, isPending] = useActionState<TripState, FormData>(updateTrip, {});

  return (
    <>
      <div aria-live="polite">
        {state.error && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-rose)] px-5 py-4 font-medium">
            {state.error}
          </p>
        )}
        {state.saved && !state.error && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-amber)] px-5 py-4 font-medium">
            Saved.{" "}
            <Link href="/trips" className="underline">
              Back to trips
            </Link>
          </p>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={trip.id} />

        <div>
          <label htmlFor="name" className={label}>
            What do you call it
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={trip.name}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="places" className={label}>
            Where
          </label>
          <input
            id="places"
            name="places"
            required
            defaultValue={trip.places.join(", ")}
            className={field}
          />
          <p className="mt-2 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
            Separate places with commas.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="start" className={label}>
              From
            </label>
            <input id="start" type="date" name="start" required defaultValue={trip.start} className={field} />
          </div>
          <div>
            <label htmlFor="end" className={label}>
              Until
            </label>
            <input id="end" type="date" name="end" required defaultValue={trip.end} className={field} />
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
            defaultValue={trip.note ?? ""}
            className={field}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="grad-warm self-start rounded-full px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
