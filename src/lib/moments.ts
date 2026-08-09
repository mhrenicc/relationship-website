import "server-only";
import { getPhotoStore } from "@/lib/storage";
import { moments as placeholderMoments, type Moment } from "@/lib/site-config";

/**
 * Uploaded moments win. The placeholders only exist so the prototype has
 * something to show before anything real has been added.
 */
export async function getMoments(): Promise<{
  moments: Moment[];
  isPlaceholder: boolean;
}> {
  const stored = await getPhotoStore().readManifest();

  if (stored.length === 0) {
    return { moments: placeholderMoments, isPlaceholder: true };
  }

  const moments = [...stored]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: entry.date,
      caption: entry.caption,
      src: entry.url,
      alt: entry.alt,
    }));

  return { moments, isPlaceholder: false };
}
