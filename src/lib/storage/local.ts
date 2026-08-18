import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Collection, CollectionShape, PhotoStore } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "photos", "uploads");
const DATA_DIR = path.join(process.cwd(), "data");

const fileFor = (collection: Collection) => path.join(DATA_DIR, `${collection}.json`);

export const localStore: PhotoStore = {
  kind: "local",

  // contentType is unused locally: the extension in `key` is enough for the
  // static file server. Blob needs it explicitly.
  async save(bytes, key) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    // `key` is generated server-side, never taken from the upload
    await writeFile(path.join(UPLOAD_DIR, key), bytes);
    return `/photos/uploads/${key}`;
  },

  async read<C extends Collection>(collection: C): Promise<CollectionShape[C][]> {
    try {
      const raw = await readFile(fileFor(collection), "utf8");
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CollectionShape[C][]) : [];
    } catch (error: unknown) {
      // A missing file just means nothing has been added yet
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw error;
    }
  },

  async write<C extends Collection>(
    collection: C,
    rows: CollectionShape[C][],
    options?: { allowShrink?: boolean },
  ) {
    if (!options?.allowShrink) {
      const current = await this.read(collection);
      if (rows.length < current.length) {
        throw new Error(
          `Refusing to write ${rows.length} ${collection} over ${current.length} already stored.`,
        );
      }
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(fileFor(collection), JSON.stringify(rows, null, 2), "utf8");
  },
};
