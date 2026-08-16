import type { Metadata } from "next";
import Image from "next/image";
import { SectionShell } from "@/components/SectionShell";
import { getSets } from "@/lib/moments";
import { photoSrc } from "@/lib/storage/variants";

export const metadata: Metadata = { title: "Gallery · Us" };

/** Cycled sizes, so this never collapses into an even Instagram grid. */
const SPANS = [
  "sm:col-span-7 aspect-4/5",
  "sm:col-span-5 aspect-square",
  "sm:col-span-5 aspect-3/4",
  "sm:col-span-7 aspect-3/2",
];

export default async function GalleryPage() {
  const { sets, isPlaceholder } = await getSets();
  // Every photograph from every set, flattened. The gallery shows pictures;
  // the feed shows sets.
  const photos = sets.flatMap((set) =>
    set.photos.map((photo) => ({ ...photo, caption: set.caption, date: set.date })),
  );
  const hasContent = !isPlaceholder && photos.length > 0;

  return (
    <SectionShell
      title="Gallery"
      intro="The photographs worth keeping, not all of them."
      awaiting="Nothing in here yet. It works better with thirty good photographs than three hundred ordinary ones."
      tint="rose"
    >
      {hasContent ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
          {photos.map((photo, index) => (
            <figure
              key={photo.key}
              className={`group relative overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
                SPANS[index % SPANS.length]
              }`}
            >
              <Image
                src={photoSrc(photo, "display")}
                alt={photo.alt || photo.caption}
                fill
                loading="eager"
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
            </figure>
          ))}
        </div>
      ) : undefined}
    </SectionShell>
  );
}
