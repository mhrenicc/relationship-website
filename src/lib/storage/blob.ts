import "server-only";
import { list, put } from "@vercel/blob";
import type { Collection, CollectionShape, PhotoStore } from "./types";

const fileFor = (collection: Collection) => `${collection}.json`;

export const blobStore: PhotoStore = {
  kind: "blob",

  async save(bytes, key, contentType) {
    const { url } = await put(`photos/${key}`, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType,
      allowOverwrite: true,
    });
    return url;
  },

  async read<C extends Collection>(collection: C): Promise<CollectionShape[C][]> {
    const name = fileFor(collection);
    const { blobs } = await list({ prefix: name, limit: 1 });
    if (blobs.length === 0) return [];

    // no-store because the manifest changes on every upload and a cached copy
    // silently loses whatever was added since
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) return [];

    const parsed: unknown = await response.json();
    return Array.isArray(parsed) ? (parsed as CollectionShape[C][]) : [];
  },

  async write<C extends Collection>(collection: C, rows: CollectionShape[C][]) {
    await put(fileFor(collection), JSON.stringify(rows, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  },
};
