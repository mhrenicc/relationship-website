import "server-only";
import { readLive } from "@/lib/records";
import type { StoredSet } from "@/lib/storage";

/**
 * Uploaded content wins outright. The placeholders only exist so the prototype
 * has something to show before anything real has been added — the moment one
 * real set exists, every placeholder disappears, so the site is never half
 * fake.
 */
export async function getSets(): Promise<{ sets: StoredSet[]; isPlaceholder: boolean }> {
  const stored = await readLive("sets");

  if (stored.length === 0) {
    return { sets: [], isPlaceholder: true };
  }

  // Newest first. `date` is the day it happened; `createdAt` breaks ties so
  // several sets added for the same day keep a stable order.
  const sets = [...stored].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
  });

  return { sets, isPlaceholder: false };
}

/** Only sets flagged for the feed; trip content can opt out of it. */
export async function getFeedSets(): Promise<{ sets: StoredSet[]; isPlaceholder: boolean }> {
  const { sets, isPlaceholder } = await getSets();
  return { sets: sets.filter((s) => s.inFeed), isPlaceholder };
}

export async function getSetsForTrip(tripId: string): Promise<StoredSet[]> {
  const { sets } = await getSets();
  return sets.filter((s) => s.tripId === tripId);
}
