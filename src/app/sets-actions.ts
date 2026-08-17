"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { deleteRecord, findRecord, restoreRecord, updateRecord } from "@/lib/records";
import type { Author, StoredPhoto } from "@/lib/storage";
import { UnsupportedImageError, processUpload } from "@/lib/storage/images";

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/** Everything a set change can touch. */
function revalidateEverywhere(): void {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/trips");
  revalidatePath("/trips/[id]", "page");
  revalidatePath("/deleted");
}

export type SetState = { error?: string; saved?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const AUTHORS = new Set<Author>(["marko", "partner"]);
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 40;

/**
 * Edits a set's caption, date, author and feed placement.
 *
 * Photographs are handled separately — adding needs a file upload and removing
 * needs a confirmation, and folding both into one submit makes a caption fix
 * feel dangerous.
 */
export async function updateSet(_prev: SetState, formData: FormData): Promise<SetState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const addedBy = String(formData.get("addedBy") ?? "").trim() as Author;
  const tripId = String(formData.get("tripId") ?? "").trim();
  // Same hidden-companion trick as the add form: an unticked checkbox sends
  // nothing, which is indistinguishable from the field not being rendered.
  const inFeed = formData.getAll("inFeed").map(String).includes("on");

  if (!id) return { error: "Nothing to save." };
  if (caption.length === 0) return { error: "Add a caption so you know what this was." };
  if (caption.length > 300) return { error: "That caption is too long." };
  if (!ISO.test(date) || Number.isNaN(Date.parse(date))) return { error: "Pick a valid date." };
  if (!AUTHORS.has(addedBy)) return { error: "Say who posted this." };

  const found = await updateRecord("sets", id, (set) => ({
    ...set,
    caption,
    date,
    addedBy,
    inFeed,
    ...(tripId ? { tripId } : { tripId: undefined }),
    // Alt text follows the caption, exactly as it does on upload — but only
    // for photographs that never got their own, so a real alt is not clobbered.
    photos: set.photos.map((photo) =>
      photo.alt === set.caption || photo.alt === "" ? { ...photo, alt: caption } : photo,
    ),
  }));

  if (!found) return { error: "That entry no longer exists." };

  revalidateEverywhere();
  return { saved: caption };
}

/** Hides a set. The photographs survive and can be restored from /deleted. */
export async function deleteSet(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await deleteRecord("sets", id);
  revalidateEverywhere();
}

export async function restoreSet(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await restoreRecord("sets", id);
  revalidateEverywhere();
}

/**
 * Removes one photograph from a set.
 *
 * Removing the last one is refused rather than silently deleting the set — a
 * set with no photographs is not a thing this site can render, and turning a
 * photo removal into an entry deletion behind his back is the kind of surprise
 * that makes people stop trusting the buttons.
 */
export async function removePhoto(setId: string, photoKey: string): Promise<SetState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const set = await findRecord("sets", setId);
  if (!set) return { error: "That entry no longer exists." };
  if (!set.photos.some((photo) => photo.key === photoKey)) {
    return { error: "That photograph is already gone." };
  }
  if (set.photos.length === 1) {
    return { error: "That is the last photograph. Delete the whole entry instead." };
  }

  await updateRecord("sets", setId, (row) => ({
    ...row,
    photos: row.photos.filter((photo) => photo.key !== photoKey),
  }));

  revalidateEverywhere();
  return { saved: "Photograph removed." };
}

/**
 * Hearts or unhearts one photograph.
 *
 * Favourites are not decoration: they are the selection the trip banner draws
 * from, so this is the one control that changes how a trip opens.
 */
export async function toggleFavorite(setId: string, photoKey: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await updateRecord("sets", setId, (set) => ({
    ...set,
    photos: set.photos.map((photo) =>
      photo.key === photoKey ? { ...photo, favorite: !photo.favorite } : photo,
    ),
  }));

  revalidateEverywhere();
}

/** Adds more photographs to a set that already exists. */
export async function addPhotos(_prev: SetState, formData: FormData): Promise<SetState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

  if (!id) return { error: "Nothing to add to." };
  if (files.length === 0) return { error: "Pick at least one photo." };
  if (files.length > MAX_FILES) {
    return { error: `That is ${files.length} photos. Add them in batches of ${MAX_FILES} or fewer.` };
  }
  if (files.some((f) => f.size > MAX_BYTES)) {
    return { error: "One of those is over 25MB. Try a smaller version." };
  }

  const set = await findRecord("sets", id);
  if (!set) return { error: "That entry no longer exists." };

  try {
    const added: StoredPhoto[] = [];
    for (const file of files) {
      // UUID key: nothing the uploader controls reaches the path.
      const photo = await processUpload(file, randomUUID());
      added.push({ ...photo, alt: set.caption });
    }

    await updateRecord("sets", id, (row) => ({ ...row, photos: [...row.photos, ...added] }));
  } catch (error: unknown) {
    if (error instanceof UnsupportedImageError) {
      return { error: `${error.message}. Use JPG, PNG, WebP, AVIF or HEIC.` };
    }
    console.error("Adding photographs failed", error);
    return { error: "Saving those failed. Try again." };
  }

  revalidateEverywhere();
  return { saved: `${files.length} photograph${files.length === 1 ? "" : "s"} added.` };
}
