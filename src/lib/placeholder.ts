import "server-only";
import { heroPhoto, memoryPool, moments } from "@/lib/site-config";
import type { StoredList, StoredMilestone, StoredPlace, StoredSet, StoredTrip } from "@/lib/storage";

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

export const placeholderTrips: StoredTrip[] = [
  { id: "p-trip-1", name: "The one where we ran out of water", places: ["Zion", "Page"],
    start: "2025-07-14", end: "2025-07-21", createdAt: "2025-07-21" },
  { id: "p-trip-2", name: "Nobody's idea of a rest", places: ["El Nido"],
    start: "2025-03-03", end: "2025-03-05", createdAt: "2025-03-05" },
  { id: "p-trip-3", name: "Both suitcases, one hand", places: ["Split"],
    start: "2024-10-09", end: "2024-10-13", createdAt: "2024-10-13" },
  { id: "p-trip-4", name: "The long detour", places: ["Merzouga"],
    start: "2024-02-02", end: "2024-02-04", createdAt: "2024-02-04" },
];

export const placeholderLists: StoredList[] = [
  { id: "p-list-1", name: "Things to cook properly", createdAt: "2025-01-01",
    items: [
      { id: "a", text: "That soup from the market", done: true, addedBy: "marko" },
      { id: "b", text: "Your mother's recipe, correctly", done: false, addedBy: "partner" },
      { id: "c", text: "Anything that takes four hours", done: false, addedBy: "marko" },
    ] },
  { id: "p-list-2", name: "Films you made me watch", createdAt: "2025-01-01",
    items: [
      { id: "a", text: "Paddington 2", done: true, addedBy: "partner" },
      { id: "b", text: "The one with the boat", done: true, addedBy: "partner" },
      { id: "c", text: "Whatever is next", done: false, addedBy: "marko" },
    ] },
];

export const placeholderMilestones: StoredMilestone[] = [
  { id: "p-ms-1", date: "2024-01-06", text: "We met", addedBy: "marko", significant: true, createdAt: "2024-01-06" },
  { id: "p-ms-2", date: "2024-03-19", text: "First kiss", addedBy: "partner", significant: true, createdAt: "2024-03-19" },
  { id: "p-ms-3", date: "2024-09-01", text: "Moved in", addedBy: "marko", significant: true, createdAt: "2024-09-01" },
  // Quiet by design, so the two weights are both visible before anything real exists.
  { id: "p-ms-4", date: "2025-07-14", text: "The wrong ferry", addedBy: "partner", significant: false, createdAt: "2025-07-14" },
];

export const placeholderPlaces: StoredPlace[] = [
  { id: "p-1", name: "Split", country: "Croatia", lat: 43.51, lon: 16.44, been: true, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-2", name: "Vienna", country: "Austria", lat: 48.21, lon: 16.37, been: true, addedBy: "partner", createdAt: "2024-01-01" },
  { id: "p-3", name: "Ljubljana", country: "Slovenia", lat: 46.06, lon: 14.51, been: true, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-4", name: "Rome", country: "Italy", lat: 41.9, lon: 12.5, been: true, addedBy: "partner", createdAt: "2024-01-01" },
  { id: "p-5", name: "Lisbon", country: "Portugal", lat: 38.72, lon: -9.14, been: true, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-6", name: "Reykjavik", country: "Iceland", lat: 64.15, lon: -21.94, been: false, addedBy: "partner", createdAt: "2024-01-01" },
  { id: "p-7", name: "El Nido", country: "Philippines", lat: 11.2, lon: 119.42, been: false, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-8", name: "Tokyo", country: "Japan", lat: 35.68, lon: 139.69, been: false, addedBy: "partner", createdAt: "2024-01-01" },
  { id: "p-9", name: "Merzouga", country: "Morocco", lat: 31.1, lon: -4.01, been: false, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-10", name: "Zion", country: "United States", lat: 37.3, lon: -113.03, been: false, addedBy: "marko", createdAt: "2024-01-01" },
  { id: "p-11", name: "Queenstown", country: "New Zealand", lat: -45.03, lon: 168.66, been: false, addedBy: "partner", createdAt: "2024-01-01" },
  { id: "p-12", name: "Cape Town", country: "South Africa", lat: -33.92, lon: 18.42, been: false, addedBy: "partner", createdAt: "2024-01-01" },
];
