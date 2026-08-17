import "server-only";
import { get, put } from "@vercel/blob";
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
    const result = await get(fileFor(collection), { access: "private", useCache: false });
    if (!result) return [];

    const text = await new Response(result.stream).text();
    try {
      const parsed: unknown = JSON.parse(text);
      return Array.isArray(parsed) ? (parsed as CollectionShape[C][]) : [];
    } catch {
      // A truncated or half-written document should not take the whole site
      // down; an empty read is recoverable, a crash on every page is not.
      return [];
    }
  },

  async write<C extends Collection>(collection: C, rows: CollectionShape[C][]) {
    await put(fileFor(collection), JSON.stringify(rows, null, 2), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  },
};
