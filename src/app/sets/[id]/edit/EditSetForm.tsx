"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { uploadPhoto } from "@/app/add/actions";
import { addPhotos, removePhoto, updateSet, type SetState } from "@/app/sets-actions";
import { downscale } from "@/lib/downscale";
import type { StoredPhoto, StoredSet, StoredTrip } from "@/lib/storage";
import { photoSrc } from "@/lib/storage/variants";

const label = "mb-2 block font-medium text-[var(--color-ink)]";
const field =
  "w-full rounded-[var(--radius)] border border-[var(--color-bone-2)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] focus-visible:border-[var(--color-violet)] focus-visible:shadow-[0_0_0_3px_var(--wash-violet)]";
const button =
  "grad-warm self-start rounded-full px-8 py-4 text-lg font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow,opacity] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 disabled:opacity-60";

/**
 * One photograph in the editor, with its own remove control.
 *
 * Removing is immediate rather than staged into the Save button, because a
 * half-saved form that has already destroyed something is worse than two
 * separate deliberate actions.
 */
function PhotoTile({
  setId,
  photoKey,
  src,
  alt,
  canRemove,
  onError,
}: {
  setId: string;
  photoKey: string;
  src: string;
  alt: string;
  canRemove: boolean;
  onError: (message: string) => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await removePhoto(setId, photoKey);
      if (result.error) onError(result.error);
      setIsConfirming(false);
    });
  };

  return (
    <figure className="group relative overflow-hidden rounded-[var(--radius)] bg-[var(--color-bone-2)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set */}
      <img src={src} alt={alt} className="aspect-square w-full object-cover" />

      {canRemove &&
        (isConfirming ? (
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-2 rounded-full bg-[oklch(0.2_0.04_320/0.78)] px-2 py-1.5 backdrop-blur">
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="rounded-full bg-[var(--color-rose)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "…" : "Remove"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isPending}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-ink)]"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirming(true)}
            aria-label="Remove this photograph"
            className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-ink)] opacity-0 shadow-[var(--shadow-soft)] transition-opacity duration-[var(--duration-quick)] group-hover:opacity-100 focus-visible:opacity-100"
          >
            Remove
          </button>
        ))}
    </figure>
  );
}

export function EditSetForm({ set, trips }: { set: StoredSet; trips: StoredTrip[] }) {
  const [state, formAction, isPending] = useActionState<SetState, FormData>(updateSet, {});
  const [addState, setAddState] = useState<SetState>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [photoError, setPhotoError] = useState("");

  const isAdding = progress !== null;
  const problem = state.error || addState.error || photoError;
  const done = state.saved || addState.saved;

  /**
   * Photographs go up one at a time, each downscaled in the browser first.
   *
   * Posting the whole batch to one Server Action is what made this form fail
   * from a phone: the body is capped at 1MB by Next and near 4.5MB by Vercel,
   * and a single phone photograph is 3-5MB. This is the same shape /add and
   * the trip dump already use.
   */
  async function addSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const data = new FormData(element);
    const files = data.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setAddState({ error: "Pick at least one photo." });
      return;
    }

    setAddState({});
    setPhotoError("");
    setProgress({ done: 0, total: files.length });

    const uploaded: StoredPhoto[] = [];
    for (const [index, file] of files.entries()) {
      const smaller = await downscale(file);
      const one = new FormData();
      one.set("photo", smaller);

      const result = await uploadPhoto(one);
      if (result.error || !result.photo) {
        setProgress(null);
        setAddState({ error: result.error ?? "That photo could not be processed." });
        return;
      }
      uploaded.push(result.photo);
      setProgress({ done: index + 1, total: files.length });
    }

    const outcome = await addPhotos(set.id, uploaded);
    setProgress(null);
    setAddState(outcome);
    if (outcome.saved) element.reset();
  }

  return (
    <>
      <div aria-live="polite">
        {problem && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-rose)] px-5 py-4 font-medium">
            {problem}
          </p>
        )}
        {done && !problem && (
          <p className="mb-6 rounded-[var(--radius)] bg-[var(--wash-amber)] px-5 py-4 font-medium">
            Saved. <Link href="/" className="underline">Back to the front page</Link>
          </p>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={set.id} />

        <div>
          <label htmlFor="caption" className={label}>
            Caption
          </label>
          <input
            id="caption"
            name="caption"
            required
            maxLength={300}
            defaultValue={set.caption}
            className={field}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className={label}>
              When it happened
            </label>
            <input id="date" type="date" name="date" required defaultValue={set.date} className={field} />
          </div>
          <div>
            <label htmlFor="addedBy" className={label}>
              Posted by
            </label>
            <select id="addedBy" name="addedBy" defaultValue={set.addedBy} className={field}>
              <option value="marko">Marko</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tripId" className={label}>
            Part of a trip <span className="font-normal">(optional)</span>
          </label>
          <select id="tripId" name="tripId" defaultValue={set.tripId ?? ""} className={field}>
            <option value="">Not part of a trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 font-medium">
          {/* The hidden companion makes "unticked" distinguishable from "not
              rendered" — an unticked checkbox sends nothing at all. */}
          <input type="hidden" name="inFeed" value="off" />
          <input type="checkbox" name="inFeed" value="on" defaultChecked={set.inFeed} className="size-5" />
          Show this in the main feed
        </label>

        <button type="submit" disabled={isPending} className={button}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-lead)] font-semibold">
          Photographs <span className="font-normal text-[var(--color-ink-soft)]">({set.photos.length})</span>
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {set.photos.map((photo) => (
            <PhotoTile
              key={photo.key}
              setId={set.id}
              photoKey={photo.key}
              src={photoSrc(photo, "thumb")}
              alt={photo.alt || set.caption}
              canRemove={set.photos.length > 1}
              onError={setPhotoError}
            />
          ))}
        </div>

        {set.photos.length === 1 && (
          <p className="mt-4 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
            The last photograph cannot be removed on its own. Delete the whole entry instead.
          </p>
        )}

        <form onSubmit={addSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="photos" className={label}>
              Add more to this entry
            </label>
            <input
              id="photos"
              type="file"
              name="photos"
              accept="image/*"
              multiple
              required
              className={field}
            />
          </div>
          <button type="submit" disabled={isAdding} className={button}>
            {progress ? `Uploading ${progress.done} of ${progress.total}…` : "Add photographs"}
          </button>
        </form>
      </section>
    </>
  );
}
