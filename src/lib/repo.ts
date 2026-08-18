import "server-only";
import {
  deleteRecord,
  findRecord,
  purgeRecord,
  readDeleted,
  readLive,
  restoreRecord,
  updateRecord,
} from "@/lib/records";
import { getPhotoStore } from "@/lib/storage";
import type { Collection, CollectionShape } from "@/lib/storage";

/**
 * One repository per collection, and the only way the app touches storage.
 *
 * Before this, every action opened the store itself and did its own
 * read-append-write. Six copies of the same three lines meant six places that
 * could get it wrong — and getting it wrong there is what wiped a collection,
 * because a read that comes back empty turns the next append into an
 * overwrite of everything.
 *
 * Callers now say `moments.add(moment)` and never see the array. That leaves
 * exactly one implementation to keep correct, and it makes the storage layout
 * swappable: moving from one document per collection to one blob per record
 * would change this file and nothing else.
 */
function repo<C extends Collection>(collection: C) {
  type Row = CollectionShape[C];

  return {
    collection,

    /** Live rows, deleted ones filtered out. */
    all: (): Promise<Row[]> => readLive(collection),

    /** Deleted rows, newest deletion first. */
    deleted: (): Promise<Row[]> => readDeleted(collection),

    /** One row by id, whether or not it is deleted. */
    find: (id: string): Promise<Row | undefined> => findRecord(collection, id),

    async add(row: Row): Promise<Row> {
      const store = getPhotoStore();
      // Reads the raw collection rather than the live one: a deleted row must
      // survive an unrelated append, and `all()` would silently drop it.
      const existing = await store.read(collection);
      await store.write(collection, [...existing, row]);
      return row;
    },

    /** Applies a change to one row. False when the id is not there. */
    update: (id: string, change: (row: Row) => Row): Promise<boolean> =>
      updateRecord(collection, id, change),

    /** Soft delete: sets `deletedAt` so it can be restored. */
    remove: (id: string): Promise<boolean> => deleteRecord(collection, id),

    restore: (id: string): Promise<boolean> => restoreRecord(collection, id),

    /** Permanent. The only operation that shrinks a collection. */
    purge: (id: string): Promise<boolean> => purgeRecord(collection, id),
  };
}

export const sets = repo("sets");
export const trips = repo("trips");
export const places = repo("places");
export const lists = repo("lists");
export const moments = repo("milestones");
