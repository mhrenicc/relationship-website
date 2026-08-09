"use client";

import { useActionState, useEffect, useState } from "react";
import { addMoment, type AddState } from "./actions";

const initialState: AddState = {};

const field =
  "w-full rounded-[var(--radius)] border border-[var(--color-line)] bg-white px-5 py-3.5 text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] focus:border-[var(--color-rose)] focus:shadow-[0_0_0_4px_oklch(0.56_0.22_352/0.15)]";

const label =
  "mb-2 block text-[length:var(--text-meta)] font-medium text-[var(--color-ink-soft)]";

/** Owns the object URL so it can be revoked on unmount without an effect
    that writes state during render. */
function PhotoField() {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup only. Object URLs leak for the life of the page otherwise.
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div>
      <label htmlFor="photo" className={label}>
        Photo
      </label>
      <input
        id="photo"
        type="file"
        name="photo"
        required
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return file ? URL.createObjectURL(file) : null;
          });
        }}
        className={`${field} file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-violet)] file:px-4 file:py-2 file:font-medium file:text-white`}
      />
      <p className="mt-2 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
        JPG, PNG, WebP or AVIF. Up to 12MB.
      </p>

      {preview && (
        // next/image cannot optimise a blob: URL, and this never leaves the page
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="The photo you just picked, before saving"
          className="mt-4 max-h-72 w-full rounded-[var(--radius)] object-cover shadow-[var(--shadow-soft)]"
        />
      )}
    </div>
  );
}

export function AddForm() {
  const [state, formAction, isPending] = useActionState(
    addMoment,
    initialState,
  );

  return (
    <>
      <div aria-live="polite">
        {state.error && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-rose)] px-5 py-4 font-medium text-[var(--color-ink)]">
            {state.error}
          </p>
        )}
        {state.added && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-amber)] px-5 py-4 font-medium text-[var(--color-ink)]">
            Saved &ldquo;{state.added}&rdquo;. Add another?
          </p>
        )}
      </div>

      {/* Remounting on success clears every field, including the file input */}
      <form
        key={state.token ?? "new"}
        action={formAction}
        className="flex flex-col gap-6"
      >
        <PhotoField />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="caption" className={label}>
              What was it
            </label>
            <input
              id="caption"
              name="caption"
              required
              maxLength={120}
              placeholder="The long drive back"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="date" className={label}>
              When
            </label>
            <input
              id="date"
              type="date"
              name="date"
              required
              className={field}
            />
          </div>
        </div>

        <div>
          <label htmlFor="alt" className={label}>
            Description <span className="font-normal">(optional)</span>
          </label>
          <input
            id="alt"
            name="alt"
            maxLength={200}
            placeholder="Describe the photo for screen readers"
            className={field}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="grad-warm self-start rounded-full px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-lift)] active:translate-y-0 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Add it"}
        </button>
      </form>
    </>
  );
}
