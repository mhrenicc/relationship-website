import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PhotoStore, StoredMoment } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "photos", "uploads");
const MANIFEST = path.join(process.cwd(), "data", "moments.json");

export const localStore: PhotoStore = {
  kind: "local",

  async save(file, key) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    // `key` is generated server-side, never taken from the upload
    await writeFile(path.join(UPLOAD_DIR, key), bytes);
    return `/photos/uploads/${key}`;
  },

  async readManifest() {
    try {
      const raw = await readFile(MANIFEST, "utf8");
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as StoredMoment[]) : [];
    } catch (error: unknown) {
      // A missing manifest just means nothing has been added yet
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw error;
    }
  },

  async writeManifest(moments) {
    await mkdir(path.dirname(MANIFEST), { recursive: true });
    await writeFile(MANIFEST, JSON.stringify(moments, null, 2), "utf8");
  },
};
