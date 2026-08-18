import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getSetsForTrip } from "@/lib/moments";
import * as repo from "@/lib/repo";
import { EditTripForm } from "./EditTripForm";

export const metadata: Metadata = { title: "Edit trip · Us" };

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await repo.trips.find(id);

  if (!trip || trip.deletedAt) notFound();

  const sets = await getSetsForTrip(id);
  const photoCount = sets.reduce((total, set) => total + set.photos.length, 0);

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(2rem,1rem+4vw,4rem)]">
        <p className="mb-4 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
          <Link href="/trips" className="underline">
            ← Back to trips
          </Link>
        </p>
        <h1 className="text-[length:var(--text-display)]">Edit this trip</h1>
        <p className="mt-4 max-w-[52ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          {photoCount > 0
            ? `${photoCount} photograph${photoCount === 1 ? "" : "s"} in ${sets.length} ${sets.length === 1 ? "entry" : "entries"}. Deleting the trip keeps every one of them — they move into the feed.`
            : "Nothing has been added to this trip yet."}
        </p>

        <div className="mt-12">
          <EditTripForm trip={trip} />
        </div>
      </main>
    </>
  );
}
