"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { purgeRecord } from "@/lib/records";
import type { Collection } from "@/lib/storage";

/**
 * Permanent removal, and the only thing on the site that is.
 *
 * Restricted to collections by name from a fixed set rather than taking any
 * string, so a crafted request cannot aim this at something unintended.
 */
const PURGEABLE = new Set<Collection>(["sets", "trips", "places", "lists", "milestones"]);

export async function purge(collection: Collection, id: string): Promise<void> {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) return;
  if (!PURGEABLE.has(collection)) return;

  await purgeRecord(collection, id);
  revalidatePath("/deleted");
}
