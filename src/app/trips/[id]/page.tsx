import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteHeart } from "@/components/FavoriteHeart";
import { getSetsForTrip } from "@/lib/moments";
import { findRecord } from "@/lib/records";
import type { StoredPhoto } from "@/lib/storage";
import { photoSrc } from "@/lib/storage/variants";
import "../../home.css";
import "./trip.css";

/**
 * Re-rolled per request, so the banner is different every time the trip is
 * opened. Without this the page would be cached and the "random" selection
 * would be frozen at build time — which is the whole point of the feature,
 * silently lost.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Trip · Us" };

/**
 * Where the floating photographs go.
 *
 * Hand-placed rather than generated: random positions collide, drift off the
 * edges and wander across the title. These are chosen to leave the middle band
 * clear for the type, and each carries its own drift so no two move together.
 * `minor` slots are the small ones, dropped on a phone rather than shrunk.
 */
// The custom-property half is spelled out because React.CSSProperties alone
// rejects `--w` in a typed literal.
type Slot = {
  minor?: boolean;
  style: React.CSSProperties & Record<`--${string}`, string>;
};

const SLOTS: Slot[] = [
  { style: { left: "3%", top: "14%", "--w": "clamp(8rem,17vw,15rem)", "--rot": "-5deg", "--dx": "10px", "--dy": "-18px", "--dr": "1.6deg", "--dur": "13s", "--delay": "0s", "--ratio": "4/5" } },
  { style: { right: "4%", top: "8%", "--w": "clamp(7rem,15vw,13.5rem)", "--rot": "4.5deg", "--dx": "-12px", "--dy": "16px", "--dr": "-1.8deg", "--dur": "16s", "--delay": "-3s", "--ratio": "3/4" } },
  { style: { left: "13%", bottom: "7%", "--w": "clamp(6.5rem,13vw,12rem)", "--rot": "6deg", "--dx": "14px", "--dy": "12px", "--dr": "-2deg", "--dur": "18s", "--delay": "-7s", "--ratio": "1/1" } },
  { style: { right: "12%", bottom: "10%", "--w": "clamp(7.5rem,16vw,14rem)", "--rot": "-6.5deg", "--dx": "-10px", "--dy": "-15px", "--dr": "2.2deg", "--dur": "15s", "--delay": "-5s", "--ratio": "4/5" } },
  { minor: true, style: { left: "36%", top: "3%", "--w": "clamp(5rem,10vw,9rem)", "--rot": "8deg", "--dx": "8px", "--dy": "14px", "--dr": "-2.6deg", "--dur": "20s", "--delay": "-11s", "--ratio": "1/1" } },
  { minor: true, style: { right: "30%", bottom: "3%", "--w": "clamp(4.5rem,9vw,8rem)", "--rot": "-9deg", "--dx": "-9px", "--dy": "-11px", "--dr": "2.8deg", "--dur": "22s", "--delay": "-14s", "--ratio": "3/4" } },
];

/**
 * Which slots to use for a given number of photographs.
 *
 * Taking the first N clusters everything along the top and leaves the bottom
 * of the band empty, which is exactly how it looked with two photographs.
 * Spreading them keeps the composition balanced however few there are.
 */
function spreadSlots(count: number): number[] {
  if (count >= SLOTS.length) return SLOTS.map((_, index) => index);
  const step = SLOTS.length / count;
  return Array.from({ length: count }, (_, index) => Math.floor(index * step));
}

/** Fisher-Yates. `sort(() => Math.random() - 0.5)` is not a shuffle. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const formatRange = (start: string, end: string) => {
  const from = new Date(start);
  const to = new Date(end);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();

  return sameMonth
    ? `${from.getDate()}–${to.getDate()} ${month.format(to)} ${to.getFullYear()}`
    : `${from.getDate()} ${month.format(from)} – ${to.getDate()} ${month.format(to)} ${to.getFullYear()}`;
};

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await findRecord("trips", id);
  if (!trip || trip.deletedAt) notFound();

  const sets = await getSetsForTrip(id);
  const photos = sets.flatMap((set) =>
    set.photos.map((photo) => ({ photo, setId: set.id, caption: set.caption })),
  );

  // Favourites are what the banner is for. Before anything has been hearted it
  // falls back to whatever the trip has, so a new trip still opens with
  // something rather than an empty band.
  const hearted = photos.filter((entry) => entry.photo.favorite);
  const pool = hearted.length > 0 ? hearted : photos;
  const floating = shuffled(pool).slice(0, SLOTS.length);
  const slotIndices = spreadSlots(floating.length);

  return (
    <>
      <nav className="stuck">
        <Link className="wordmark" href="/">
          Us
        </Link>
        <div className="navlinks">
          <Link href="/trips">All trips</Link>
          <Link href="/gallery">Gallery</Link>
          <Link className="add" href={`/add?trip=${trip.id}`}>
            Add photos
          </Link>
        </div>
      </nav>

      <header className="tripbanner">
        <Link className="tripedit" href={`/trips/${trip.id}/edit`}>
          Edit
        </Link>

        {floating.map((entry, index) => {
          const slot = SLOTS[slotIndices[index]];
          return (
            <figure
              key={entry.photo.key}
              className={`tripfloat ${slot.minor ? "tripfloat--minor" : ""}`}
              style={slot.style}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set */}
              <img
                src={photoSrc(entry.photo, "display")}
                alt={entry.photo.alt || entry.caption}
              />
            </figure>
          );
        })}

        <div className="tripbanner__inner">
          <h1>{trip.name}</h1>
          <div className="tripbanner__meta">
            <span className="tripbanner__chip">{formatRange(trip.start, trip.end)}</span>
            <span className="tripbanner__chip">{trip.places.join(" · ")}</span>
            {photos.length > 0 && (
              <span className="tripbanner__chip">
                {photos.length} photograph{photos.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {trip.note && <p style={{ maxWidth: "44ch", color: "var(--ink-soft)" }}>{trip.note}</p>}
        </div>
      </header>

      <main className="pad">
        <div className="sechead">
          <h2>Everything from this trip</h2>
          <Link className="more" href={`/add?trip=${trip.id}`}>
            Add more →
          </Link>
        </div>

        {photos.length === 0 ? (
          <p className="tripempty">
            Nothing has been added to this trip yet.{" "}
            <Link href={`/add?trip=${trip.id}`}>Add the first photographs →</Link>
          </p>
        ) : (
          <>
            <div className="tripshots">
              {photos.map((entry) => (
                <Shot key={entry.photo.key} {...entry} />
              ))}
            </div>
            <p
              style={{
                marginTop: "clamp(1.5rem,3vw,2.5rem)",
                fontSize: "0.8125rem",
                color: "var(--ink-soft)",
              }}
            >
              {hearted.length > 0
                ? `${hearted.length} favourited. The top of this page draws from them, and re-picks every visit.`
                : "Heart the ones you love — the top of this page is built from them."}
            </p>
          </>
        )}
      </main>
    </>
  );
}

function Shot({
  photo,
  setId,
  caption,
}: {
  photo: StoredPhoto;
  setId: string;
  caption: string;
}) {
  return (
    <figure className="shot">
      {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized is set */}
      <img src={photoSrc(photo, "thumb")} alt={photo.alt || caption} />
      <FavoriteHeart setId={setId} photoKey={photo.key} isFavorite={Boolean(photo.favorite)} />
    </figure>
  );
}
