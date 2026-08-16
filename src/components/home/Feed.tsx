import Link from "next/link";
import type { StoredSet } from "@/lib/storage";
import { photoSrc } from "@/lib/storage/variants";

/**
 * A set's footprint is derived from what it holds — how many photographs, and
 * which way the lead one faces. Nothing is hand-placed, so the run reshapes
 * itself as the archive grows rather than repeating a designed rhythm.
 */
function footprint(set: StoredSet): { span: number; height: string } {
  const count = set.photos.length;
  if (count >= 4) return { span: 7, height: "clamp(17rem,30vw,26rem)" };
  if (count >= 2) return { span: 5, height: "clamp(14rem,23vw,20rem)" };

  const lead = set.photos[0];
  const isPortrait = lead.height > lead.width;
  return isPortrait
    ? { span: 3, height: "clamp(15rem,26vw,23rem)" }
    : { span: 4, height: "clamp(11rem,18vw,16rem)" };
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

const who = (id: StoredSet["addedBy"]) => (id === "marko" ? "Marko" : "Partner");

export function Feed({ sets }: { sets: StoredSet[] }) {
  return (
    <section className="feedwrap pad" id="feed">
      <div className="feed">
        {sets.map((set) => {
          const { span, height } = footprint(set);
          const extra = set.photos.slice(1, 3);

          return (
            <Link
              key={set.id}
              href={`/gallery#${set.id}`}
              className="card"
              style={{ "--span": span, "--h": height } as React.CSSProperties}
            >
              <span className="obj">
                {set.photos.length > 1 && (
                  <span className="count">{set.photos.length} photos</span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element -- see Hero */}
                <img
                  src={photoSrc(set.photos[0], "display")}
                  alt={set.photos[0].alt || set.caption}
                />
                {extra.length > 0 && (
                  <span className="pile">
                    {extra.map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element -- see Hero
                      <img key={photo.key} src={photoSrc(photo, "thumb")} alt="" />
                    ))}
                  </span>
                )}
              </span>
              <span className="cap">
                <b>{set.caption}</b>
                <span>
                  {formatDate(set.date)} · added by <em>{who(set.addedBy)}</em>
                </span>
              </span>
            </Link>
          );
        })}

        <p className="feedmore">
          <Link href="/gallery">Everything, in order →</Link>
        </p>
      </div>
    </section>
  );
}
