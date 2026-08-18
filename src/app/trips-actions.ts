"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import * as repo from "@/lib/repo";
import { type StoredTrip } from "@/lib/storage";

export type TripState = { error?: string; added?: string; saved?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/** Reads and validates the trip fields shared by adding and editing. */
function readTripFields(formData: FormData):
  | { error: string }
  | { name: string; start: string; end: string; note: string; places: string[] } {
  // A trip is named by where it was — "Lisbon, Portugal". There is no separate
  // title to invent, so the location field is the name, and the comma-split
  // parts are kept as `places` for the map and for trips across several stops.
  const where = String(formData.get("places") ?? "").trim();
  const name = where;
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const places = where
    .split(",")
    .map((place) => place.trim())
    .filter(Boolean);

  if (name.length === 0) return { error: "Where was it?" };
  if (name.length > 120) return { error: "That is too long." };
  if (!ISO.test(start) || Number.isNaN(Date.parse(start))) return { error: "Pick a start date." };
  if (!ISO.test(end) || Number.isNaN(Date.parse(end))) return { error: "Pick an end date." };
  if (Date.parse(end) < Date.parse(start)) {
    return { error: "The trip cannot end before it starts." };
  }
  if (places.length === 0) return { error: "Where was it?" };

  return { name, start, end, note, places };
}

export async function addTrip(_prev: TripState, formData: FormData): Promise<TripState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const fields = readTripFields(formData);
  if ("error" in fields) return fields;
  const { name, start, end, note, places } = fields;

  const trip: StoredTrip = {
    id: randomUUID(),
    name,
    places,
    start,
    end,
    ...(note ? { note } : {}),
    createdAt: new Date().toISOString(),
  };

  await repo.trips.add(trip);

  revalidatePath("/");
  revalidatePath("/trips");
  return { added: name };
}

export async function updateTrip(_prev: TripState, formData: FormData): Promise<TripState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Nothing to save." };

  const fields = readTripFields(formData);
  if ("error" in fields) return fields;
  const { name, start, end, note, places } = fields;

  const found = await repo.trips.update(id, (trip) => ({
    ...trip,
    name,
    places,
    start,
    end,
    ...(note ? { note } : { note: undefined }),
  }));

  if (!found) return { error: "That trip no longer exists." };

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/deleted");
  return { saved: name };
}

/**
 * Hides a trip and releases its photographs into the feed.
 *
 * Deleting a container must not destroy its contents — that was decided
 * explicitly. The sets keep their `tripId`, so restoring the trip picks them
 * straight back up; only `inFeed` is forced on, so the photographs stay
 * visible somewhere rather than being stranded behind a trip nobody can reach.
 */
export async function deleteTrip(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await repo.trips.remove(id);

  const attached = await repo.sets.all();
  for (const set of attached) {
    if (set.tripId === id && !set.inFeed) {
      await repo.sets.update(set.id, (row) => ({ ...row, inFeed: true }));
    }
  }

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/gallery");
  revalidatePath("/deleted");
}

export async function restoreTrip(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await repo.trips.restore(id);
  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/deleted");
}
