import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { getPhotoStore } from "@/lib/storage";
import { AddForm } from "./AddForm";

export const metadata: Metadata = { title: "Add · Us" };

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip } = await searchParams;
  const trips = await getPhotoStore().read("trips");

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(2rem,1rem+4vw,4rem)]">
        <h1 className="text-[length:var(--text-display)]">Add something</h1>
        <p className="mt-4 max-w-[50ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          Pick as many photographs as belong together — they become one entry
          with one caption.
        </p>

        <div className="mt-12">
          <AddForm trips={trips} preselectedTrip={trip} />
        </div>
      </main>
    </>
  );
}
