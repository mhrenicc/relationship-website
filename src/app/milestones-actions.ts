"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { deleteRecord, restoreRecord } from "@/lib/records";
import { getPhotoStore, type Author, type StoredMilestone } from "@/lib/storage";

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export type MomentState = { error?: string; added?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const AUTHORS = new Set<Author>(["marko", "partner"]);

/** Short by design — the ribbon shows these at a glance, not in paragraphs. */
const MAX_TEXT = 60;

export async function addMoment(_prev: MomentState, formData: FormData): Promise<MomentState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const text = String(formData.get("text") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const addedBy = String(formData.get("addedBy") ?? "marko").trim() as Author;
  const significant = formData.getAll("significant").map(String).includes("on");

  if (text.length === 0) return { error: "What happened?" };
  if (text.length > MAX_TEXT) return { error: `Keep it under ${MAX_TEXT} characters.` };
  if (!ISO.test(date) || Number.isNaN(Date.parse(date))) return { error: "Pick a date." };

  const moment: StoredMilestone = {
    id: randomUUID(),
    date,
    text,
    addedBy: AUTHORS.has(addedBy) ? addedBy : "marko",
    significant,
    createdAt: new Date().toISOString(),
  };

  const store = getPhotoStore();
  // Straight to the store rather than readLive, so a deleted moment is not
  // dropped from the file as a side effect of adding a new one.
  const existing = await store.read("milestones");
  await store.write("milestones", [...existing, moment]);

  revalidatePath("/");
  revalidatePath("/deleted");
  return { added: text };
}

export async function deleteMoment(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await deleteRecord("milestones", id);
  revalidatePath("/");
  revalidatePath("/deleted");
}

export async function restoreMoment(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await restoreRecord("milestones", id);
  revalidatePath("/");
  revalidatePath("/deleted");
}
