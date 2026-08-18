"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { Collection } from "@/lib/storage";

/**
 * Permanent removal, and the only thing on the site that is.
 *
 * Restricted to collections by name from a fixed set rather than taking any
 * string, so a crafted request cannot aim this at something unintended.
 */
const PURGEABLE = {
  sets: repo.sets,
  trips: repo.trips,
  places: repo.places,
  lists: repo.lists,
  milestones: repo.moments,
} as const;

export async function purge(collection: Collection, id: string): Promise<void> {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) return;
  const repo = PURGEABLE[collection];
  if (!repo) return;

  await repo.purge(id);
  revalidatePath("/deleted");
}
