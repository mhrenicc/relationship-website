"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { deleteRecord, restoreRecord, updateRecord } from "@/lib/records";
import { getPhotoStore, type Author, type StoredList } from "@/lib/storage";

/** Server Actions are public endpoints, so every one re-checks the gate. */
async function assertUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

function revalidateEverywhere(): void {
  revalidatePath("/");
  revalidatePath("/bucketlists");
  revalidatePath("/deleted");
}

export type ListState = { error?: string; added?: string };

const AUTHORS = new Set<Author>(["marko", "partner"]);
const MAX_NAME = 80;
const MAX_ITEM = 140;

export async function addList(_prev: ListState, formData: FormData): Promise<ListState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length === 0) return { error: "Give the list a name." };
  if (name.length > MAX_NAME) return { error: "That name is too long." };

  const list: StoredList = {
    id: randomUUID(),
    name,
    items: [],
    createdAt: new Date().toISOString(),
  };

  const store = getPhotoStore();
  // Straight to the store rather than readLive, so a deleted list is not
  // dropped from the file as a side effect of adding a new one.
  const existing = await store.read("lists");
  await store.write("lists", [...existing, list]);

  revalidateEverywhere();
  return { added: name };
}

export async function renameList(_prev: ListState, formData: FormData): Promise<ListState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Nothing to rename." };
  if (name.length === 0) return { error: "Give the list a name." };
  if (name.length > MAX_NAME) return { error: "That name is too long." };

  const found = await updateRecord("lists", id, (list) => ({ ...list, name }));
  if (!found) return { error: "That list no longer exists." };

  revalidateEverywhere();
  return { added: name };
}

export async function deleteList(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await deleteRecord("lists", id);
  revalidateEverywhere();
}

export async function restoreList(id: string): Promise<void> {
  if (!(await assertUnlocked())) return;
  await restoreRecord("lists", id);
  revalidateEverywhere();
}

export async function addItem(_prev: ListState, formData: FormData): Promise<ListState> {
  if (!(await assertUnlocked())) {
    return { error: "Your session expired. Reload and unlock again." };
  }

  const listId = String(formData.get("listId") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const addedByRaw = String(formData.get("addedBy") ?? "marko").trim() as Author;
  const addedBy = AUTHORS.has(addedByRaw) ? addedByRaw : "marko";

  if (!listId) return { error: "Nothing to add to." };
  if (text.length === 0) return { error: "Type something first." };
  if (text.length > MAX_ITEM) return { error: "That is too long for one line." };

  const found = await updateRecord("lists", listId, (list) => ({
    ...list,
    items: [...list.items, { id: randomUUID(), text, done: false, addedBy }],
  }));
  if (!found) return { error: "That list no longer exists." };

  revalidateEverywhere();
  return { added: text };
}

/**
 * Items have no deleted state of their own. A line on a list is small enough
 * that a soft delete would cost more than it saves, and the list it belongs to
 * is still recoverable as a whole.
 */
export async function toggleItem(listId: string, itemId: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await updateRecord("lists", listId, (list) => ({
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    ),
  }));

  revalidateEverywhere();
}

export async function deleteItem(listId: string, itemId: string): Promise<void> {
  if (!(await assertUnlocked())) return;

  await updateRecord("lists", listId, (list) => ({
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
  }));

  revalidateEverywhere();
}
