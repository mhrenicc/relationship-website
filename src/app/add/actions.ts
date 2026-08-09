"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { getPhotoStore, type StoredMoment } from "@/lib/storage";

export type AddState = {
  error?: string;
  added?: string;
  /** Unique per success, so the form can remount to clear itself. */
  token?: string;
};

/** Extension is derived from the validated type, never from the filename. */
const ACCEPTED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

const MAX_BYTES = 12 * 1024 * 1024;

export async function addMoment(
  _prev: AddState,
  formData: FormData,
): Promise<AddState> {
  // Server Actions are public endpoints, so the gate is re-checked here
  // rather than trusted from proxy.ts.
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const file = formData.get("photo");
  const caption = String(formData.get("caption") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pick a photo first." };
  }
  if (!ACCEPTED.has(file.type)) {
    return { error: "That file type will not work. Use JPG, PNG, WebP or AVIF." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That photo is over 12MB. Try a smaller version." };
  }
  if (caption.length === 0) {
    return { error: "Add a caption so you know what this was." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return { error: "Pick a valid date." };
  }

  const store = getPhotoStore();

  try {
    // UUID filename: nothing the uploader controls reaches the path.
    const key = `${randomUUID()}.${ACCEPTED.get(file.type)}`;
    const url = await store.save(file, key);

    const moment: StoredMoment = {
      id: key,
      url,
      caption,
      date,
      alt: alt.length > 0 ? alt : caption,
      createdAt: new Date().toISOString(),
    };

    const existing = await store.readManifest();
    await store.writeManifest([...existing, moment]);
  } catch (error: unknown) {
    console.error("Upload failed", error);
    return { error: "Saving that failed. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/timeline");

  return { added: caption, token: randomUUID() };
}
