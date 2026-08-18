"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/app/add/actions";
import { dumpIntoTrip } from "@/app/trips-actions";
import { downscale } from "@/lib/downscale";
import type { Author, StoredPhoto } from "@/lib/storage";

/**
 * Dumping a pile of photographs into a trip.
 *
 * Deliberately asks for nothing: no title, no date, no per-photo anything. The
 * trip already says where and when, and being interrogated per batch on a
 * phone is what stops a backlog ever going up. Sorting them into groups
 * happens later, in the app, where it is not tedious.
 *
 * Photographs go up one at a time because a whole batch in one request exceeds
 * the Server Action body limit — the same reason /add works this way.
 */
export function TripDump({ tripId }: { tripId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [inFeed, setInFeed] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<{ error?: string; added?: string }>({});

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;

    const list = [...files];
    setMessage({});
    setProgress({ done: 0, total: list.length });

    const uploaded: StoredPhoto[] = [];
    for (const [index, file] of list.entries()) {
      const smaller = await downscale(file);
      const one = new FormData();
      one.set("photo", smaller);

      const result = await uploadPhoto(one);
      if (result.error || !result.photo) {
        setProgress(null);
        setMessage({ error: result.error ?? "That photo could not be processed." });
        return;
      }
      uploaded.push(result.photo);
      setProgress({ done: index + 1, total: list.length });
    }

    const saved = window.localStorage.getItem("postingAs");
    const outcome = await dumpIntoTrip(tripId, uploaded, {
      inFeed,
      addedBy: (saved === "partner" ? "partner" : "marko") as Author,
    });

    setProgress(null);
    setMessage(outcome);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="tripdump">
      <div className="tripdump__row">
        <button
          type="button"
          className="tripdump__pick"
          disabled={progress !== null}
          onClick={() => input.current?.click()}
        >
          {progress ? `Uploading ${progress.done} of ${progress.total}…` : "Dump photos in"}
        </button>

        <label className="tripdump__feed">
          <input
            type="checkbox"
            checked={inFeed}
            onChange={(event) => setInFeed(event.target.checked)}
          />
          Also put in gallery
        </label>
      </div>

      {/* Hidden, because a bare file input cannot be styled and reads badly on
          a phone. The button above stands in for it. */}
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
        className="tripdump__input"
        onChange={(event) => void onPick(event.target.files)}
      />

      <p aria-live="polite" className="tripdump__msg">
        {message.error ?? (message.added ? `${message.added} added.` : "")}
      </p>
    </div>
  );
}
