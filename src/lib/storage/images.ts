import "server-only";
import sharp from "sharp";
import { getPhotoStore } from "./index";
import { VARIANTS, type StoredPhoto, type VariantName } from "./types";

/**
 * Why this exists at all: unresized phone photographs are 3-5 MB, which fills
 * a 1 GB store in roughly 250 photos and blows the monthly transfer budget in
 * about 25 gallery views. Resized, the same store holds thousands and a
 * gallery view costs megabytes rather than hundreds of them.
 *
 * Exceeding the transfer limit on Vercel's free tier removes access for 30
 * days rather than issuing a bill, so the failure mode is a dead link.
 */

const QUALITY = 78;

/** Accepted on upload. Anything else is rejected rather than stored unread. */
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);

export class UnsupportedImageError extends Error {}

/**
 * Resizes one upload into every variant and stores them.
 *
 * Variants never enlarge: `withoutEnlargement` keeps a small original small
 * rather than upscaling it into a bigger file than it started as.
 */
export async function processUpload(file: File, key: string): Promise<StoredPhoto> {
  if (!ACCEPTED.has(file.type)) {
    throw new UnsupportedImageError(`${file.type || "unknown type"} is not an image we can store`);
  }

  const input = Buffer.from(await file.arrayBuffer());

  // `rotate()` with no argument applies the EXIF orientation and drops the
  // tag. Without it, phone photos land sideways and every consumer has to
  // compensate.
  const base = sharp(input, { failOn: "error" }).rotate();

  const metadata = await base.metadata();
  if (!metadata.width || !metadata.height) {
    throw new UnsupportedImageError("could not read the image dimensions");
  }

  const store = getPhotoStore();
  const urls = {} as Record<VariantName, string>;
  let width = metadata.width;
  let height = metadata.height;

  for (const [name, size] of Object.entries(VARIANTS) as [VariantName, number][]) {
    const pipeline = base
      .clone()
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    urls[name] = await store.save(data, `${key}-${name}.webp`, "image/webp");

    if (name === "display") {
      width = info.width;
      height = info.height;
    }
  }

  return {
    key,
    urls,
    width,
    height,
    // Filled in by the caller from the set's caption; kept here so a photo is
    // never stored without the field existing at all.
    alt: "",
  };
}
