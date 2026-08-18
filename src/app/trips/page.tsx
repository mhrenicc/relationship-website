import type { Metadata } from "next";
import Link from "next/link";
import { deleteTrip } from "@/app/trips-actions";
import { CardActions } from "@/components/CardActions";
import { getSets } from "@/lib/moments";
import * as repo from "@/lib/repo";
import { photoSrc } from "@/lib/storage/variants";
import { TripForm } from "./TripForm";
import "../home.css";

export const metadata: Metadata = { title: "Trips · Us" };

const formatRange = (start: string, end: string) => {
  const from = new Date(start);
  const to = new Date(end);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();

  return sameMonth
    ? `${from.getDate()}–${to.getDate()} ${month.format(to)} ${to.getFullYear()}`
    : `${from.getDate()} ${month.format(from)} – ${to.getDate()} ${month.format(to)} ${to.getFullYear()}`;
};

export default async function TripsPage() {
  const [trips, { sets }] = await Promise.all([repo.trips.all(), getSets()]);

  const ordered = [...trips].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <>
      <nav className="stuck">
        <Link className="wordmark" href="/">
          Us
        </Link>
        <span className="navlinks">
          <Link href="/#feed">Photos</Link>
          <Link href="/trips">Trips</Link>
          <Link href="/bucketlists">Bucketlists</Link>
          <Link className="add" href="/add">
            Add
          </Link>
        </span>
      </nav>

      <main className="pad" style={{ paddingTop: "clamp(6rem,12vh,9rem)" }}>
        <div className="sechead">
          <h2>Trips</h2>
          <Link className="more" href="/">
            ← Back
          </Link>
        </div>

        {ordered.length === 0 ? (
          <p className="empty">
            No trips yet. Make one below, then add photographs to it from Add.
          </p>
        ) : (
          <div className="tripgrid">
            {ordered.map((trip, index) => {
              const photos = sets.filter((s) => s.tripId === trip.id).flatMap((s) => s.photos);
              const lead = photos[0];
              const span = index % 2 === 0 ? 7 : 5;

              return (
                // See Feed: an article, so the buttons are not inside an anchor.
                <article
                  key={trip.id}
                  id={trip.id}
                  className="card trip"
                  style={
                    { "--span": span, "--h": "clamp(14rem,24vw,22rem)" } as React.CSSProperties
                  }
                >
                  <Link href={`/trips/${trip.id}`}>
                    <span className="obj">
                      {lead ? (
                        // eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set
                        <img src={photoSrc(lead, "display")} alt={lead.alt || trip.name} />
                      ) : (
                        <span className="obj__empty">Add photographs →</span>
                      )}
                    </span>
                    <span className="cap">
                      <b>{trip.name}</b>
                      {trip.places.join(", ") !== trip.name && (
                      <span className="places">{trip.places.join(" · ")}</span>
                    )}
                      <span className="dates">
                        {formatRange(trip.start, trip.end)}
                        {photos.length > 0 && ` · ${photos.length} photos`}
                      </span>
                      {trip.note && <span className="dates">{trip.note}</span>}
                    </span>
                  </Link>

                  <CardActions
                    editHref={`/trips/${trip.id}/edit`}
                    onDelete={deleteTrip.bind(null, trip.id)}
                    what="trip"
                  />
                </article>
              );
            })}
          </div>
        )}

        <section style={{ marginTop: "clamp(3rem,6vw,5rem)", maxWidth: "42rem" }}>
          <div className="sechead">
            <h2 style={{ fontSize: "clamp(1.5rem,1.2rem + 1.4vw,2.25rem)" }}>Add a trip</h2>
          </div>
          <TripForm />
        </section>
      </main>
    </>
  );
}
