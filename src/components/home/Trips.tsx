import Link from "next/link";
import { deleteTrip } from "@/app/trips-actions";
import { CardActions } from "@/components/CardActions";
import type { StoredSet, StoredTrip } from "@/lib/storage";
import { photoSrc } from "@/lib/storage/variants";

/** Uneven by design: spans and heights cycle so no two neighbours match. */
const SHAPES = [
  { span: 7, height: "clamp(14rem,23vw,21rem)" },
  { span: 5, height: "clamp(16rem,27vw,25rem)" },
  { span: 5, height: "clamp(13rem,21vw,19rem)" },
  { span: 7, height: "clamp(15rem,25vw,22rem)" },
] as const;

const formatRange = (start: string, end: string) => {
  const from = new Date(start);
  const to = new Date(end);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();

  return sameMonth
    ? `${from.getDate()}–${to.getDate()} ${month.format(to)} ${to.getFullYear()}`
    : `${from.getDate()} ${month.format(from)} – ${to.getDate()} ${month.format(to)} ${to.getFullYear()}`;
};

export function Trips({ trips, sets }: { trips: StoredTrip[]; sets: StoredSet[] }) {
  if (trips.length === 0) return null;

  return (
    <section className="trips pad" id="trips">
      <div className="sechead">
        <h2>Trips</h2>
        <Link className="more" href="/trips">
          All {trips.length} →
        </Link>
      </div>

      <div className="tripgrid">
        {trips.map((trip, index) => {
          const shape = SHAPES[index % SHAPES.length];
          const photos = sets.filter((s) => s.tripId === trip.id).flatMap((s) => s.photos);
          const lead = photos[0];

          return (
            // See Feed: an article, so the buttons are not inside an anchor.
            <article
              key={trip.id}
              className="card trip"
              style={{ "--span": shape.span, "--h": shape.height } as React.CSSProperties}
            >
              <Link href={`/trips#${trip.id}`}>
                <span className="obj">
                  {lead ? (
                    // eslint-disable-next-line @next/next/no-img-element -- see Hero
                    <img src={photoSrc(lead, "display")} alt={lead.alt || trip.name} />
                  ) : (
                    <span className="obj__empty">No photographs yet</span>
                  )}
                </span>
                <span className="cap">
                  <b>{trip.name}</b>
                  <span className="places">{trip.places.join(" · ")}</span>
                  <span className="dates">
                    {formatRange(trip.start, trip.end)}
                    {photos.length > 0 && ` · ${photos.length} photos`}
                  </span>
                </span>
              </Link>

              {!trip.id.startsWith("p-trip-") && (
                <CardActions
                  editHref={`/trips/${trip.id}/edit`}
                  onDelete={deleteTrip.bind(null, trip.id)}
                  what="trip"
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
