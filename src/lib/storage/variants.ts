/**
 * Sizes and quality live here rather than in `images.ts` because the rendering
 * side needs to know about variants too, and `images.ts` pulls in sharp and
 * `server-only`. Nothing in this file may import either.
 */

/** The sizes every uploaded photograph is stored in, longest edge in pixels. */
export const VARIANTS = {
  /** The pile behind a card, and anywhere a photograph is incidental. */
  thumb: 480,
  /** Feed cards and trip covers. */
  display: 1600,
  /**
   * The hero, and eventually opening a photograph properly.
   *
   * Sized for the worst case it actually has to survive: a 1536px viewport at
   * device pixel ratio 2, with the hero scaling 1.12x on scroll. 1600px was
   * being stretched to roughly twice its width there, which is what "the
   * photos look bad" was.
   */
  full: 2800,
} as const;

export type VariantName = keyof typeof VARIANTS;

/**
 * WebP quality per variant. Thumbs are shown small enough that artefacts do
 * not survive the downscale; anything shown large is worth the bytes.
 */
export const QUALITY: Record<VariantName, number> = {
  thumb: 74,
  display: 80,
  full: 80,
};

/** Largest first — the order `photoSrc` falls back through. */
const DESCENDING: VariantName[] = ["full", "display", "thumb"];

/**
 * The URL for a variant, falling back to a smaller one when it is missing.
 *
 * Records written before a variant existed simply do not have it. Reading
 * `urls.full` directly on one of those yields `undefined` and renders a broken
 * image, so every consumer goes through here instead.
 */
export function photoSrc(
  photo: { urls: Partial<Record<VariantName, string>> },
  want: VariantName,
): string {
  const from = DESCENDING.indexOf(want);
  for (const name of DESCENDING.slice(from)) {
    const url = photo.urls[name];
    if (url) return url;
  }
  // Older and larger are both exhausted; anything present beats nothing.
  return Object.values(photo.urls).find(Boolean) ?? "";
}
