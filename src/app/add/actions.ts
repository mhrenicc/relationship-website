"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { Author, StoredPhoto, StoredSet } from "@/lib/storage";
import { UnsupportedImageError, processUpload } from "@/lib/storage/images";

/**
 * One photograph per request.
 *
 * A whole set in one request cannot work: Vercel caps a function's body at
 * about 4.5MB, so even downscaled, four or five photographs together exceed
 * it. Uploading them one at a time removes the cliff entirely — a set of forty
 * is forty small requests rather than one impossible one.
 */
export async function uploadPhoto(
  formData: FormData,
): Promise<{ photo?: StoredPhoto; error?: string }> {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "That file was empty." };
  if (file.size > MAX_BYTES) return { error: `${file.name} is too large.` };

  try {
    // UUID key: nothing the uploader controls reaches the path.
    const photo = await processUpload(file, randomUUID());
    return { photo };
  } catch (error: unknown) {
    if (error instanceof UnsupportedImageError) {
      return { error: `${file.name}: ${error.message}` };
    }
    console.error("Processing a photo failed", error);
    return { error: `${file.name} could not be processed.` };
  }
}

/** Records a set from photographs already uploaded one by one. */
export async function createSet(
  photos: StoredPhoto[],
  fields: {
    caption: string;
    date: string;
    addedBy: Author;
    tripId?: string;
    inFeed: boolean;
  },
): Promise<AddState> {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const caption = fields.caption.trim();
  if (photos.length === 0) return { error: "Pick at least one photo." };
  if (photos.length > MAX_FILES) return { error: `Add them in batches of ${MAX_FILES} or fewer.` };
  if (caption.length === 0) return { error: "Add a caption so you know what this was." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date) || Number.isNaN(Date.parse(fields.date))) {
    return { error: "Pick a valid date." };
  }
  if (!AUTHORS.has(fields.addedBy)) return { error: "Say who is posting this." };

  const set: StoredSet = {
    id: randomUUID(),
    // Alt text derives from the caption rather than asking for the same
    // sentence twice.
    photos: photos.map((photo) => ({ ...photo, alt: caption })),
    caption,
    date: fields.date,
    addedBy: fields.addedBy,
    ...(fields.tripId ? { tripId: fields.tripId } : {}),
    inFeed: fields.inFeed,
    createdAt: new Date().toISOString(),
  };

  try {
    await repo.sets.add(set);
  } catch (error: unknown) {
    console.error("Saving a set failed", error);
    const detail = error instanceof Error ? error.message : String(error);
    return { error: `Could not save that. ${detail}` };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/trips");

  return {
    added: photos.length === 1 ? caption : `${caption} (${photos.length} photos)`,
    token: randomUUID(),
  };
}

export type AddState = {
  error?: string;
  added?: string;
  /** Unique per success, so the form can remount to clear itself. */
  token?: string;
};

/** Generous, because originals are resized before storage and never kept at this size. */
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 40;

const AUTHORS = new Set<Author>(["marko", "partner"]);

export async function addSet(_prev: AddState, formData: FormData): Promise<AddState> {
  // Server Actions are public endpoints, so the gate is re-checked here
  // rather than trusted from proxy.ts.
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const caption = String(formData.get("caption") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const addedByRaw = String(formData.get("addedBy") ?? "").trim() as Author;
  const tripId = String(formData.get("tripId") ?? "").trim();
  // No picker rendered at all -> default true. Picker rendered -> the hidden
  // "off" is always sent, and "on" only when actually ticked. Siloing trip
  // content is the failure mode, so unticking has to be a deliberate act.
  const feedValues = formData.getAll("inFeed").map(String);
  const inFeed = feedValues.length === 0 ? true : feedValues.includes("on");

  if (files.length === 0) {
    return { error: "Pick at least one photo." };
  }
  if (files.length > MAX_FILES) {
    return { error: `That is ${files.length} photos. Add them in batches of ${MAX_FILES} or fewer.` };
  }
  if (files.some((f) => f.size > MAX_BYTES)) {
    return { error: "One of those is over 25MB. Try a smaller version." };
  }
  if (caption.length === 0) {
    return { error: "Add a caption so you know what this was." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return { error: "Pick a valid date." };
  }
  if (!AUTHORS.has(addedByRaw)) {
    return { error: "Say who is posting this." };
  }


  try {
    const photos = [];
    for (const file of files) {
      // UUID key: nothing the uploader controls reaches the path.
      const photo = await processUpload(file, randomUUID());
      // Alt text derives from the caption rather than asking for the same
      // sentence twice. A per-photo override can be added later.
      photos.push({ ...photo, alt: caption });
    }

    const set: StoredSet = {
      id: randomUUID(),
      photos,
      caption,
      date,
      addedBy: addedByRaw,
      ...(tripId ? { tripId } : {}),
      inFeed,
      createdAt: new Date().toISOString(),
    };

    await repo.sets.add(set);
  } catch (error: unknown) {
    if (error instanceof UnsupportedImageError) {
      return { error: `${error.message}. Use JPG, PNG, WebP, AVIF or HEIC.` };
    }
    console.error("Upload failed", error);
    return { error: "Saving that failed. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/trips");

  return {
    added: files.length === 1 ? caption : `${caption} (${files.length} photos)`,
    token: randomUUID(),
  };
}
