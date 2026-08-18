import "server-only";
import { getPhotoStore } from "@/lib/storage";
import type { Collection, CollectionShape } from "@/lib/storage";

/**
 * The mechanics behind `src/lib/repo.ts`, which is what the app should import.
 * Nothing outside the repository is expected to call these directly.
 *
 * The single place records are read and written.
 *
 * Deleting marks `deletedAt` rather than dropping the row, so nothing is ever
 * actually lost to a misclick — but that only holds if every read filters
 * deleted rows out. Going through `store.read` directly returns them, which is
 * the one way to reintroduce ghosts, so pages and actions use this module and
 * `store.read` stays for the deleted view and for writes.
 *
 * Read-modify-write is not atomic. Two people saving different edits to the
 * same collection within the same second can lose one of them. For two people
 * on a private site that is a theoretical problem, and fixing it properly means
 * a real database rather than a JSON document.
 */

/** Live rows only. What every page should call. */
export async function readLive<C extends Collection>(
  collection: C,
): Promise<CollectionShape[C][]> {
  const rows = await getPhotoStore().read(collection);
  return rows.filter((row) => !row.deletedAt);
}

/** Deleted rows only, newest deletion first. Powers the recently-deleted view. */
export async function readDeleted<C extends Collection>(
  collection: C,
): Promise<CollectionShape[C][]> {
  const rows = await getPhotoStore().read(collection);
  return rows
    .filter((row) => row.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
}

/** One row by id, whether or not it is deleted. Editing a row needs the row. */
export async function findRecord<C extends Collection>(
  collection: C,
  id: string,
): Promise<CollectionShape[C] | undefined> {
  const rows = await getPhotoStore().read(collection);
  return rows.find((row) => row.id === id);
}

/**
 * Applies `change` to the row with this id and writes the collection back.
 * Returns false when there is no such row, so callers can report a stale link
 * rather than silently doing nothing.
 */
export async function updateRecord<C extends Collection>(
  collection: C,
  id: string,
  change: (row: CollectionShape[C]) => CollectionShape[C],
): Promise<boolean> {
  const store = getPhotoStore();
  const rows = await store.read(collection);
  if (!rows.some((row) => row.id === id)) return false;

  await store.write(
    collection,
    rows.map((row) => (row.id === id ? change(row) : row)),
  );
  return true;
}

/** Hides a row from the site. The row and its images both survive. */
export async function deleteRecord<C extends Collection>(
  collection: C,
  id: string,
): Promise<boolean> {
  const at = new Date().toISOString();
  return updateRecord(collection, id, (row) => ({ ...row, deletedAt: at }));
}

/** Brings a deleted row back. */
export async function restoreRecord<C extends Collection>(
  collection: C,
  id: string,
): Promise<boolean> {
  return updateRecord(collection, id, (row) => {
    // The key is removed rather than set to undefined, so the stored JSON does
    // not accumulate a dead `deletedAt: null` on everything ever restored.
    const live = { ...row };
    delete live.deletedAt;
    return live;
  });
}

/**
 * Removes a row for good. Only ever called from the deleted view, on something
 * already deleted once. Stored images are deliberately left where they are:
 * orphaned files cost a few megabytes, and deleting them is the one mistake
 * with no way back.
 */
export async function purgeRecord<C extends Collection>(
  collection: C,
  id: string,
): Promise<boolean> {
  const store = getPhotoStore();
  const rows = await store.read(collection);
  const remaining = rows.filter((row) => row.id !== id);
  if (remaining.length === rows.length) return false;

  // The only legitimate shrink: erasing one row for good.
  await store.write(collection, remaining, { allowShrink: true });
  return true;
}
