import "server-only";
import { blobStore } from "./blob";
import { localStore } from "./local";
import type { PhotoStore } from "./types";

/**
 * Deployed filesystems are read-only, so anything with a Blob token uses
 * Blob. Locally there is no token and writing to `public/` is fine, which
 * keeps development working with zero configuration.
 */
export function getPhotoStore(): PhotoStore {
  return process.env.BLOB_READ_WRITE_TOKEN ? blobStore : localStore;
}

export type { StoredMoment } from "./types";
