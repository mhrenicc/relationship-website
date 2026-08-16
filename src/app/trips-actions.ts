"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { getPhotoStore, type StoredTrip } from "@/lib/storage";

export type TripState = { error?: string; added?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function addTrip(_prev: TripState, formData: FormData): Promise<TripState> {
  // Server Actions are public endpoints, so the gate is re-checked here.
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const places = String(formData.get("places") ?? "")
    .split(",")
    .map((place) => place.trim())
    .filter(Boolean);

  if (name.length === 0) return { error: "Give the trip a name." };
  if (name.length > 120) return { error: "That name is too long." };
  if (!ISO.test(start) || Number.isNaN(Date.parse(start))) return { error: "Pick a start date." };
  if (!ISO.test(end) || Number.isNaN(Date.parse(end))) return { error: "Pick an end date." };
  if (Date.parse(end) < Date.parse(start)) {
    return { error: "The trip cannot end before it starts." };
  }
  if (places.length === 0) return { error: "Add at least one place." };

  const trip: StoredTrip = {
    id: randomUUID(),
    name,
    places,
    start,
    end,
    ...(note ? { note } : {}),
    createdAt: new Date().toISOString(),
  };

  const store = getPhotoStore();
  const existing = await store.read("trips");
  await store.write("trips", [...existing, trip]);

  revalidatePath("/");
  revalidatePath("/trips");
  return { added: name };
}
