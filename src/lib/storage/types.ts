export type StoredMoment = {
  id: string;
  url: string;
  caption: string;
  date: string;
  alt: string;
  createdAt: string;
};

/**
 * Uploads and their metadata both go through here. Local writes to disk and
 * works with no configuration; Vercel Blob is used once a token exists,
 * because deployed filesystems are read-only.
 */
export interface PhotoStore {
  readonly kind: "local" | "blob";
  save(file: File, key: string): Promise<string>;
  readManifest(): Promise<StoredMoment[]>;
  writeManifest(moments: StoredMoment[]): Promise<void>;
}
