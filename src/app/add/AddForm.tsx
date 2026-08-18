"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { StoredTrip } from "@/lib/storage";
import { downscale } from "@/lib/downscale";
import { createSet, uploadPhoto, type AddState } from "./actions";


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

type AddFormProps = {
  trips: StoredTrip[];
  preselectedTrip?: string;
};

export function AddForm({ trips, preselectedTrip }: AddFormProps) {
  const [state, setState] = useState<AddState>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const isPending = progress !== null;

  /**
   * Photographs go up one at a time, each downscaled first.
   *
   * A whole set in one request cannot work: Next caps a Server Action body at
   * 1MB by default and Vercel caps it near 4.5MB regardless, while a phone
   * photograph is 3-5MB. Sending them individually removes the ceiling, and
   * showing progress matters because forty photographs is now forty requests.
   */
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const data = new FormData(element);
    const files = data.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setState({ error: "Pick at least one photo." });
      return;
    }

    setState({});
    setProgress({ done: 0, total: files.length });

    const photos = [];
    for (const [index, file] of files.entries()) {
      const smaller = await downscale(file);
      const one = new FormData();
      one.set("photo", smaller);

      const result = await uploadPhoto(one);
      if (result.error || !result.photo) {
        setProgress(null);
        setState({ error: result.error ?? "That photo could not be processed." });
        return;
      }
      photos.push(result.photo);
      setProgress({ done: index + 1, total: files.length });
    }

    const feedValues = data.getAll("inFeed").map(String);
    const outcome = await createSet(photos, {
      caption: String(data.get("caption") ?? ""),
      date: String(data.get("date") ?? ""),
      addedBy: String(data.get("addedBy") ?? "marko") as "marko" | "partner",
      tripId: String(data.get("tripId") ?? "") || undefined,
      inFeed: feedValues.length === 0 ? true : feedValues.includes("on"),
    });

    setProgress(null);
    setState(outcome);
    if (outcome.added) element.reset();
  }

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
        ref={form}
        onSubmit={submit}
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

        {trips.length > 0 && (
          <div>
            <label htmlFor="tripId" className={label}>
              Part of a trip <span className="font-normal">(optional)</span>
            </label>
            <select
              id="tripId"
              name="tripId"
              defaultValue={preselectedTrip ?? ""}
              className={field}
            >
              <option value="">Not part of a trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
            <label className="mt-3 flex items-center gap-2 font-medium">
              {/* An unticked checkbox sends nothing, which is indistinguishable
                  from the picker not being rendered at all. The hidden field
                  makes the difference explicit. */}
              <input type="hidden" name="inFeed" value="off" />
              <input type="checkbox" name="inFeed" defaultChecked value="on" />
              Also show these in the main feed
            </label>
          </div>
        )}

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
          {progress
            ? `Uploading ${progress.done} of ${progress.total}…`
            : "Add it"}
        </button>
      </form>
    </>
  );
}
