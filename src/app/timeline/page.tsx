import type { Metadata } from "next";
import Image from "next/image";
import { SectionShell } from "@/components/SectionShell";
import { getMoments } from "@/lib/moments";

export const metadata: Metadata = { title: "Timeline · Us" };

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export default async function TimelinePage() {
  const { moments, isPlaceholder } = await getMoments();
  const hasContent = !isPlaceholder && moments.length > 0;
  const newestFirst = [...moments].reverse();

  return (
    <SectionShell
      title="Timeline"
      intro="Everything that happened, in the order it happened."
      awaiting="Nothing here yet. The first entry is the day you met, and you already know the date."
      tint="amber"
    >
      {hasContent ? (
        <ol className="flex flex-col gap-8">
          {newestFirst.map((moment, index) => (
            <li
              key={`${moment.date}-${index}`}
              className="group flex flex-col gap-6 rounded-[var(--radius-lg)] bg-white/70 p-5 shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center"
            >
              <div className="relative aspect-3/2 w-full shrink-0 overflow-hidden rounded-[var(--radius)] bg-white sm:w-72">
                <Image
                  src={moment.src}
                  alt={moment.alt}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 100vw, 18rem"
                  className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <time
                  dateTime={moment.date}
                  className="text-[length:var(--text-meta)] font-medium text-[var(--color-ink-soft)]"
                >
                  {formatDate(moment.date)}
                </time>
                <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug">
                  {moment.caption}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : undefined}
    </SectionShell>
  );
}
