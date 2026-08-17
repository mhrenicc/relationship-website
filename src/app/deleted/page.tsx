import type { Metadata } from "next";
import Link from "next/link";
import { purge } from "@/app/deleted-actions";
import { restoreMoment } from "@/app/milestones-actions";
import { restorePlace } from "@/app/places-actions";
import { restoreSet } from "@/app/sets-actions";
import { restoreTrip } from "@/app/trips-actions";
import { Nav } from "@/components/Nav";
import { readDeleted } from "@/lib/records";
import { photoSrc } from "@/lib/storage/variants";
import { DeletedRow } from "./DeletedRow";

export const metadata: Metadata = { title: "Recently deleted · Us" };

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export default async function DeletedPage() {
  const [sets, trips, places, moments] = await Promise.all([
    readDeleted("sets"),
    readDeleted("trips"),
    readDeleted("places"),
    readDeleted("milestones"),
  ]);
  const isEmpty =
    sets.length === 0 && trips.length === 0 && places.length === 0 && moments.length === 0;

  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--space-gutter)] pb-[var(--space-movement)] pt-[clamp(2rem,1rem+4vw,4rem)]">
        <p className="mb-4 text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
          <Link href="/" className="underline">
            ← Back
          </Link>
        </p>
        <h1 className="text-[length:var(--text-display)]">Recently deleted</h1>
        <p className="mt-4 max-w-[54ch] text-[length:var(--text-lead)] text-[var(--color-ink-soft)]">
          Nothing deleted from the site is thrown away. It waits here until you
          say otherwise, photographs and all.
        </p>

        {isEmpty ? (
          <p className="mt-12 rounded-[var(--radius)] bg-white/60 px-6 py-8 text-[var(--color-ink-soft)]">
            Nothing has been deleted.
          </p>
        ) : (
          <div className="mt-12 flex flex-col gap-10">
            {sets.length > 0 && (
              <section>
                <h2 className="mb-4 text-[length:var(--text-lead)] font-semibold">Entries</h2>
                <ul className="flex flex-col gap-3">
                  {sets.map((set) => (
                    <DeletedRow
                      key={set.id}
                      title={set.caption}
                      detail={`${set.photos.length} photograph${set.photos.length === 1 ? "" : "s"} · ${formatDate(set.date)}`}
                      when={set.deletedAt ? formatDate(set.deletedAt) : "recently"}
                      thumb={set.photos[0] ? photoSrc(set.photos[0], "thumb") : undefined}
                      onRestore={restoreSet.bind(null, set.id)}
                      onPurge={purge.bind(null, "sets", set.id)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {trips.length > 0 && (
              <section>
                <h2 className="mb-4 text-[length:var(--text-lead)] font-semibold">Trips</h2>
                <ul className="flex flex-col gap-3">
                  {trips.map((trip) => (
                    <DeletedRow
                      key={trip.id}
                      title={trip.name}
                      detail={trip.places.join(" · ")}
                      when={trip.deletedAt ? formatDate(trip.deletedAt) : "recently"}
                      onRestore={restoreTrip.bind(null, trip.id)}
                      onPurge={purge.bind(null, "trips", trip.id)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {places.length > 0 && (
              <section>
                <h2 className="mb-4 text-[length:var(--text-lead)] font-semibold">Places</h2>
                <ul className="flex flex-col gap-3">
                  {places.map((place) => (
                    <DeletedRow
                      key={place.id}
                      title={place.name}
                      detail={
                        place.lat === null
                          ? "Never got a location"
                          : `${place.country || "On the map"} · ${place.been ? "been" : "still to go"}`
                      }
                      when={place.deletedAt ? formatDate(place.deletedAt) : "recently"}
                      onRestore={restorePlace.bind(null, place.id)}
                      onPurge={purge.bind(null, "places", place.id)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {moments.length > 0 && (
              <section>
                <h2 className="mb-4 text-[length:var(--text-lead)] font-semibold">Moments</h2>
                <ul className="flex flex-col gap-3">
                  {moments.map((moment) => (
                    <DeletedRow
                      key={moment.id}
                      title={moment.text}
                      detail={`${formatDate(moment.date)} · ${moment.significant ? "significant" : "quiet"}`}
                      when={moment.deletedAt ? formatDate(moment.deletedAt) : "recently"}
                      onRestore={restoreMoment.bind(null, moment.id)}
                      onPurge={purge.bind(null, "milestones", moment.id)}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <p className="mt-12 max-w-[54ch] text-[length:var(--text-meta)] text-[var(--color-ink-soft)]">
          Putting a trip back also picks its photographs back up. Erasing is the
          only thing here that cannot be undone.
        </p>
      </main>
    </>
  );
}
