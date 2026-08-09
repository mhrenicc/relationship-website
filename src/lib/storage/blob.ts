import "server-only";
import { list, put } from "@vercel/blob";
import type { PhotoStore, StoredMoment } from "./types";

const MANIFEST_KEY = "moments.json";

export const blobStore: PhotoStore = {
  kind: "blob",

  async save(file, key) {
    const { url } = await put(`photos/${key}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return url;
  },

  async readManifest() {
    const { blobs } = await list({ prefix: MANIFEST_KEY, limit: 1 });
    if (blobs.length === 0) return [];

    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) return [];

    const parsed: unknown = await response.json();
    return Array.isArray(parsed) ? (parsed as StoredMoment[]) : [];
  },

  async writeManifest(moments) {
    await put(MANIFEST_KEY, JSON.stringify(moments, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  },
};
