import "server-only";
import { heroPhoto, memoryPool, moments } from "@/lib/site-config";
import type { StoredList, StoredMilestone, StoredSet, StoredTrip } from "@/lib/storage";

/**
 * Shown only while the store is empty, so the design is visible before
 * anything real has been added. The moment one real set exists these vanish
 * entirely — the site is never half real.
 *
 * None of this was chosen by Marko. Replace freely.
 */

const photo = (src: string, alt: string, portrait = false) => ({
  key: src,
  urls: { thumb: src, display: src },
  width: portrait ? 1200 : 1600,
  height: portrait ? 1600 : 1200,
  alt,
});

export const placeholderHero = heroPhoto;

export const placeholderSets: StoredSet[] = moments.map((moment, index) => ({
  id: `placeholder-${index}`,
  photos:
    index % 3 === 0
      ? [photo(moment.src, moment.alt), ...memoryPool.slice(index, index + 3).map((p) => photo(p.src, p.alt))]
      : index % 3 === 1
        ? [photo(moment.src, moment.alt, true)]
        : [photo(moment.src, moment.alt), photo(memoryPool[index % memoryPool.length].src, "")],
  caption: moment.caption,
  date: moment.date,
  addedBy: index % 2 === 0 ? "marko" : "partner",
  inFeed: true,
  createdAt: moment.date,
}));

export const placeholderTrips: StoredTrip[] = [];

export const placeholderLists: StoredList[] = [];

export const placeholderMilestones: StoredMilestone[] = [];
