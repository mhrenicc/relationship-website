"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { addSet, type AddState } from "./actions";

const initialState: AddState = {};

const field =
  "w-full rounded-[var(--radius)] border border-[var(--color-line)] bg-white px-5 py-3.5 text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] focus:border-[var(--color-rose)] focus:shadow-[0_0_0_4px_oklch(0.56_0.22_352/0.15)]";

const label =
  "mb-2 block text-[length:var(--text-meta)] font-medium text-[var(--color-ink-soft)]";

/** Owns the object URL so it can be revoked on unmount without an effect
    that writes state during render. */
function PhotoField() {
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Cleanup only. Object URLs leak for the life of the page otherwise.
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div>
      <label htmlFor="photo" className={label}>
        Photos
      </label>
      <input
        id="photo"
        type="file"
        name="photos"
        required
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setCount(event.target.files?.length ?? 0);
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return file ? URL.createObjectURL(file) : null;
          });
        }}
        className={`${field} file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-violet)] file:px-4 file:py-2 file:font-medium file:text-white`}
      />
      <p className="mt-2 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
        JPG, PNG, WebP, AVIF or HEIC. Pick as many as belong together — they become one entry with one caption.
      </p>

      {count > 1 && (
        <p className="mt-2 text-[length:var(--text-meta)] font-medium text-[var(--color-rose)]">
          {count} photos — one entry, one caption.
        </p>
      )}

      {preview && (
        // next/image cannot optimise a blob: URL, and this never leaves the page
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="The first photo you just picked, before saving"
          className="mt-4 max-h-72 w-full rounded-[var(--radius)] object-cover shadow-[var(--shadow-soft)]"
        />
      )}
    </div>
  );
}

/**
 * Who is posting. With one shared password the site has no identity of its
 * own, so this is a declared label rather than authentication. Remembered per
 * device, because a fresh decision on every upload is how it ends up wrong.
 *
 * Backed by an external store rather than state-from-effect: the server has no
 * localStorage, so seeding state in an effect renders the wrong pill for a
 * frame and trips React's hydration rules.
 */
type Who = "marko" | "partner";

const KEY = "postingAs";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function readWho(): Who {
  const saved = window.localStorage.getItem(KEY);
  return saved === "partner" ? "partner" : "marko";
}

function writeWho(next: Who) {
  window.localStorage.setItem(KEY, next);
  for (const listener of listeners) listener();
}

function PostingAs() {
  const who = useSyncExternalStore(subscribe, readWho, () => "marko" as Who);

  return (
    <fieldset className="border-0 p-0">
      <legend className={label}>Posting as</legend>
      <div className="flex gap-3">
        {(["marko", "partner"] as const).map((option) => (
          <label
            key={option}
            className={`cursor-pointer rounded-full px-5 py-2 font-medium transition-[background-color,color] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] ${
              who === option
                ? "bg-[var(--color-violet)] text-white"
                : "bg-[var(--wash-violet)] text-[var(--color-ink)] hover:bg-[var(--wash-rose)]"
            }`}
          >
            <input
              type="radio"
              name="addedBy"
              value={option}
              checked={who === option}
              onChange={() => writeWho(option)}
              className="sr-only"
            />
            {option === "marko" ? "Marko" : "Partner"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AddForm() {
  const [state, formAction, isPending] = useActionState(
    addSet,
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

        <PostingAs />

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
