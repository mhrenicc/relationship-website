"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { getPhotoStore, type Author, type StoredSet } from "@/lib/storage";
import { UnsupportedImageError, processUpload } from "@/lib/storage/images";

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
  // Unticking is the deliberate act; siloing trip content is the failure mode.
  const inFeed = formData.get("inFeed") !== "off";

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

  const store = getPhotoStore();

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

    const existing = await store.read("sets");
    await store.write("sets", [...existing, set]);
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
