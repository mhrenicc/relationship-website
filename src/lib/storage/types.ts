import type { VariantName } from "./variants";

export { QUALITY, VARIANTS, photoSrc } from "./variants";
export type { VariantName } from "./variants";

/**
 * A single photograph.
 *
 * `key` is canonical and `url` is a cache of whatever the current provider
 * resolved it to. Records that store only a URL cannot be moved between
 * providers without rewriting every one of them, which is the difference
 * between a config change and a migration.
 *
 * `urls` is partial because variants get added over time and older records
 * will not have them. Read it through `photoSrc`, never by key.
 */
export type StoredPhoto = {
  key: string;
  urls: Partial<Record<VariantName, string>>;
  /** Of the largest variant stored, so layout can reserve space before it loads. */
  width: number;
  height: number;
  alt: string;
  /**
   * Hearted by either of them. Not recorded per person: one shared password
   * means the site cannot actually tell who clicked, and a heart that claims
   * to know would be lying.
   *
   * This is what feeds the banner at the top of a trip.
   */
  favorite?: boolean;
};

export type Author = "marko" | "partner";

/**
 * Every record carries this. Deleting sets `deletedAt` and hides the record
 * everywhere; it does not remove it, and it never removes the stored image
 * files. On the deployed site a hard delete is unrecoverable, and the whole
 * point of this archive is that things in it do not get lost by accident.
 *
 * Reads must go through `src/lib/records.ts`, which filters these out. A raw
 * `store.read` returns deleted rows too.
 */
export type Deletable = {
  id: string;
  /** ISO timestamp of the deletion. Absent means live. */
  deletedAt?: string;
};

/**
 * A set: several photographs, one caption, one date. Sets rather than single
 * photos because a backlog added one at a time is data entry, and data entry
 * is how the archive dies.
 */
export type StoredSet = Deletable & {
  photos: StoredPhoto[];
  caption: string;
  /** The day it happened, not the day it was uploaded. */
  date: string;
  addedBy: Author;
  /** Set when added from inside a trip. */
  tripId?: string;
  /** Whether it also shows in the main feed. Defaults true, so trip content is never siloed. */
  inFeed: boolean;
  createdAt: string;
};

export type StoredTrip = Deletable & {
  name: string;
  places: string[];
  start: string;
  end: string;
  note?: string;
  createdAt: string;
};

export type StoredPlace = Deletable & {
  name: string;
  country: string;
  /** Null until geocoded; the UI must show these as needing a location rather than pinning them wrongly. */
  lat: number | null;
  lon: number | null;
  been: boolean;
  addedBy: Author;
  createdAt: string;
};

export type StoredList = Deletable & {
  name: string;
  items: { id: string; text: string; done: boolean; addedBy: Author }[];
  createdAt: string;
};

export type StoredMilestone = Deletable & {
  date: string;
  text: string;
  addedBy: Author;
  /**
   * Significant moments are the large marks whose text is always readable.
   * Everything else is a quiet dot you hover to read, so the ribbon can hold
   * a lot without becoming a wall of labels.
   */
  significant: boolean;
  /**
   * How much of the date is real. "month" is for a trip spanning a few days,
   * or for something you only remember the month of.
   *
   * `date` always stays a full ISO day so ordering and ribbon positioning need
   * no special cases — a month-precision moment is stored on the 15th, which
   * is what puts it in the middle of its month on the line. Only the label
   * changes. Absent on records written before this existed, which read as
   * "day".
   */
  precision?: "day" | "month";
  createdAt: string;
};

/** Everything the site persists, in one document per collection. */
export type Collection = "sets" | "trips" | "places" | "lists" | "milestones";

export type CollectionShape = {
  sets: StoredSet;
  trips: StoredTrip;
  places: StoredPlace;
  lists: StoredList;
  milestones: StoredMilestone;
};

/**
 * Uploads and their metadata both go through here. Local writes to disk and
 * works with no configuration; Vercel Blob is used once a token exists,
 * because deployed filesystems are read-only.
 *
 * Nothing outside `src/lib/storage/` may depend on which implementation is
 * running, or on the shape of the URLs it produces. That is what keeps
 * swapping provider a contained change rather than a rewrite.
 */
export interface PhotoStore {
  readonly kind: "local" | "blob";
  /** Stores one already-resized variant and returns its URL. */
  save(bytes: Buffer, key: string, contentType: string): Promise<string>;
  read<C extends Collection>(collection: C): Promise<CollectionShape[C][]>;
  /**
   * `allowShrink` must be passed to write fewer rows than are stored.
   *
   * Every write here is read-modify-write, so a read that fails or comes back
   * empty turns the next append into a wipe. Rows are only ever removed by a
   * deliberate purge, so anything else shrinking the document is a bug, and
   * the store refuses it rather than destroying the file.
   */
  write<C extends Collection>(
    collection: C,
    rows: CollectionShape[C][],
    options?: { allowShrink?: boolean },
  ): Promise<void>;
}
