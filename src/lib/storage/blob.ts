import "server-only";
import { get, list, put } from "@vercel/blob";
import type { Collection, CollectionShape, PhotoStore } from "./types";

const fileFor = (collection: Collection) => `${collection}.json`;

/**
 * The store is **private**: blobs cannot be fetched by URL and every read needs
 * the token. That is the point — a photograph's address is useless to anyone
 * without the password, so a shared or leaked link exposes nothing.
 *
 * The cost is that an <img src> cannot point at a blob. `save` therefore
 * returns an app path, and `src/app/media/[...key]/route.ts` streams the bytes
 * once it has checked the session.
 */
export const blobStore: PhotoStore = {
  kind: "blob",

  async save(bytes, key, contentType) {
    await put(`photos/${key}`, bytes, {
      access: "private",
      addRandomSuffix: false,
      contentType,
      allowOverwrite: true,
    });
    // Not the blob URL: private blobs are not fetchable by URL at all.
    return `/media/photos/${key}`;
  },

  async read<C extends Collection>(collection: C): Promise<CollectionShape[C][]> {
    // useCache:false because the document changes on every write and a cached
    // copy silently loses whatever was added since.
    const name = fileFor(collection);
    const result = await get(name, { access: "private", useCache: false });

    // `get` returning null means one of two things, and they must not be
    // conflated: the document has never been written, or it exists and could
    // not be fetched. Appending to the first is correct; appending to the
    // second writes a one-row file over everything that was there. `list` is
    // authoritative about existence, so ask it before believing the empty.
    if (!result) {
      const { blobs } = await list({ prefix: name, limit: 1 });
      const exists = blobs.some((blob) => blob.pathname === name);
      if (exists) {
        throw new Error(
          `Stored ${collection} exists but could not be read; refusing to continue rather than overwrite it.`,
        );
      }
      return [];
    }

    const text = await new Response(result.stream).text();

    // Never swallow a bad read. Every write here is read-modify-write, so
    // returning [] on a failure does not degrade gracefully — the next append
    // writes a one-row document over the top and destroys everything that was
    // there. Throwing fails the request instead, which is recoverable.
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (cause) {
      throw new Error(
        `Stored ${collection} could not be parsed; refusing to continue rather than overwrite it.`,
        { cause },
      );
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`Stored ${collection} is not a list; refusing to overwrite it.`);
    }
    return parsed as CollectionShape[C][];
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
          `Refusing to write ${rows.length} ${collection} over ${current.length} already stored. ` +
            "Rows are only removed by a purge; anything else is a failed read about to destroy data.",
        );
      }
    }

    await put(fileFor(collection), JSON.stringify(rows, null, 2), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  },
};
