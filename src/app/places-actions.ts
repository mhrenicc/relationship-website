"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { deleteRecord, readLive, restoreRecord, updateRecord } from "@/lib/records";
import { getPhotoStore, type Author, type StoredPlace } from "@/lib/storage";

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export type PlaceState = { error?: string };

/**
 * Nominatim: free, no key, and adequate for a two-person site adding a place
 * every few weeks. Their usage policy asks for an identifying User-Agent and
 * no bulk querying, both of which hold here.
 *
 * A failed lookup is not an error — the place is stored without coordinates
 * and the rail shows it as needing a location, which is better than dropping
 * a pin somewhere wrong.
 */
async function geocode(
  name: string,
): Promise<{ lat: number | null; lon: number | null; country: string }> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", name);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "us-private-archive/1.0 (personal, two users)",
        // Without this Nominatim answers in the local language: Croatia comes
        // back as "Hrvatska", which reads as a bug next to "Japan".
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { lat: null, lon: null, country: "" };

    const results: unknown = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      return { lat: null, lon: null, country: "" };
    }

    const hit = results[0] as {
      lat?: string;
      lon?: string;
      address?: { country?: string };
    };
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { lat: null, lon: null, country: "" };
    }

    return { lat, lon, country: hit.address?.country ?? "" };
  } catch {
    // Offline, rate-limited or slow: store it unpinned rather than failing.
    return { lat: null, lon: null, country: "" };
  }
}

export async function addPlace(_prev: PlaceState, formData: FormData): Promise<PlaceState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const addedBy = String(formData.get("addedBy") ?? "marko") as Author;

  if (name.length === 0) return { error: "Give the place a name." };
  if (name.length > 80) return { error: "That name is too long." };

  const store = getPhotoStore();
  const places = await readLive("places");

  if (places.some((place) => place.name.toLowerCase() === name.toLowerCase())) {
    return { error: `${name} is already on the list.` };
  }

  const located = await geocode(name);

  const place: StoredPlace = {
    id: randomUUID(),
    name,
    country: located.country,
    lat: located.lat,
    lon: located.lon,
    been: false,
    addedBy: addedBy === "partner" ? "partner" : "marko",
    createdAt: new Date().toISOString(),
  };

  await store.write("places", [...places, place]);
  revalidatePath("/");
  return {};
}

export async function togglePlace(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await updateRecord("places", id, (place) => ({ ...place, been: !place.been }));
  revalidatePath("/");
}

/**
 * Takes a place off the map and out of the rail.
 *
 * Soft, like everything else: the pin disappears but the record waits in
 * /deleted. A place is one line of text and a pair of coordinates, so losing
 * one is cheap — but a delete that behaves differently here than everywhere
 * else on the site is not worth the inconsistency.
 */
export async function deletePlace(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await deleteRecord("places", id);
  revalidatePath("/");
  revalidatePath("/deleted");
}

export async function restorePlace(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await restoreRecord("places", id);
  revalidatePath("/");
  revalidatePath("/deleted");
}
