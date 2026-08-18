"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { toStoredDate, type Precision } from "@/lib/moment-date";
import * as repo from "@/lib/repo";
import type { Author, StoredMilestone } from "@/lib/storage";

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export type MomentState = { error?: string; added?: string; saved?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;
const AUTHORS = new Set<Author>(["marko", "partner"]);

/** Short by design — the ribbon shows these at a glance, not in paragraphs. */
const MAX_TEXT = 60;

/** The fields add and edit have in common, validated once. */
function readMomentFields(
  formData: FormData,
): { error: string } | { text: string; date: string; precision: Precision; significant: boolean } {
  const text = String(formData.get("text") ?? "").trim();
  const raw = String(formData.get("date") ?? "").trim();
  const precision: Precision = formData.get("precision") === "month" ? "month" : "day";
  const significant = formData.getAll("significant").map(String).includes("on");

  if (text.length === 0) return { error: "What happened?" };
  if (text.length > MAX_TEXT) return { error: `Keep it under ${MAX_TEXT} characters.` };

  const pattern = precision === "month" ? ISO_MONTH : ISO;
  if (!pattern.test(raw)) {
    return { error: precision === "month" ? "Pick a month." : "Pick a date." };
  }

  const date = toStoredDate(raw, precision);
  if (Number.isNaN(Date.parse(date))) {
    return { error: precision === "month" ? "Pick a month." : "Pick a date." };
  }

  return { text, date, precision, significant };
}

export async function addMoment(_prev: MomentState, formData: FormData): Promise<MomentState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const addedBy = String(formData.get("addedBy") ?? "marko").trim() as Author;
  const fields = readMomentFields(formData);
  if ("error" in fields) return fields;

  const moment: StoredMilestone = {
    id: randomUUID(),
    date: fields.date,
    text: fields.text,
    addedBy: AUTHORS.has(addedBy) ? addedBy : "marko",
    significant: fields.significant,
    precision: fields.precision,
    createdAt: new Date().toISOString(),
  };

  await repo.moments.add(moment);

  revalidatePath("/");
  revalidatePath("/deleted");
  return { added: fields.text };
}

export async function updateMoment(_prev: MomentState, formData: FormData): Promise<MomentState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Nothing to save." };

  const fields = readMomentFields(formData);
  if ("error" in fields) return fields;

  const found = await repo.moments.update(id, (moment) => ({
    ...moment,
    date: fields.date,
    text: fields.text,
    significant: fields.significant,
    precision: fields.precision,
  }));

  if (!found) return { error: "That moment no longer exists." };

  revalidatePath("/");
  revalidatePath("/deleted");
  return { saved: fields.text };
}

export async function deleteMoment(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await repo.moments.remove(id);
  revalidatePath("/");
  revalidatePath("/deleted");
}

export async function restoreMoment(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await repo.moments.restore(id);
  revalidatePath("/");
  revalidatePath("/deleted");
}
