"use client";

import { formatMoment } from "@/lib/moment-date";
import type { StoredMilestone } from "@/lib/storage";

type Props = {
  met: string;
  today: string;
  milestones: StoredMilestone[];
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

/**
 * The whole history as one horizontal line at the foot of the page.
 *
 * Position is strictly proportional with no clamping — the point is to see the
 * real shape of it, the clusters and the quiet stretches. It rests at half
 * opacity and resolves on hover or keyboard focus, so it reads as a footnote
 * until you actually attend to it.
 */
export function Ribbon({ met, today, milestones }: Props) {
  const metTime = new Date(met).getTime();
  const todayTime = new Date(today).getTime();
  if (!Number.isFinite(metTime) || !Number.isFinite(todayTime)) return null;

  const ordered = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

  /**
   * The scale stretches to hold whatever exists rather than being fixed to
   * "the day we met" through "today". Anchored to those two, a moment dated
   * before they met projected to a negative percentage and rendered off the
   * left edge — present in the markup, invisible on the page, with nothing to
   * indicate it had been dropped. Anything dated ahead of today did the same
   * off the right.
   */
  const moments = ordered
    .map((milestone) => new Date(milestone.date).getTime())
    .filter((time) => Number.isFinite(time));

  const start = Math.min(metTime, ...moments);
  const end = Math.max(todayTime, ...moments);
  // A single-day range would divide by zero; one day is the smallest sane span.
  const span = Math.max(end - start, 86_400_000);

  const pct = (iso: string) => ((new Date(iso).getTime() - start) / span) * 100;

  // Days together stays met-to-today. Widening the scale does not lengthen the
  // relationship.
  const days = Math.max(0, Math.round((todayTime - metTime) / 86_400_000));

  const startYear = new Date(start).getFullYear();
  const endYear = new Date(end).getFullYear();
  const years = Array.from({ length: Math.max(0, endYear - startYear) }, (_, i) => startYear + 1 + i)
    .map((year) => ({ year, x: pct(`${year}-01-01`) }))
    .filter(({ x }) => x > 1 && x < 99);

  // Once the ribbon reaches back before they met, the day they met stops being
  // the left edge and becomes a point on the line worth marking.
  const metInside = start < metTime;
  const endsToday = end <= todayTime;

  return (
    <div className="ribbon" id="ribbon">
      <div className="ribbon__head">
        <h2>All of it, end to end</h2>
        <span>
          {days} days · {ordered.length} that mattered
        </span>
      </div>

      <div className="ribbon__scroll">
        <div className="track">
          {years.map(({ year, x }) => (
            <span key={year} className="gl" style={{ left: `${x}%` }}>
              <b>{year}</b>
            </span>
          ))}

          {ordered.map((milestone, index) => {
            // Labels alternate above and below so neighbours never collide.
            const side = index % 2 === 0 ? "up" : "down";
            const edge = index === 0 ? " first" : index === ordered.length - 1 ? " last" : "";
            // Significant moments carry their name permanently. The rest are
            // dots you hover, which is what lets the ribbon hold years of
            // small things without turning into a wall of text.
            const weight = milestone.significant ? " mk--ms" : " mk--quiet";

            const label = formatMoment(milestone);
            // Placeholders are not his and cannot be edited.
            const editable = !milestone.id.startsWith("p-ms-");

            return (
              <button
                key={milestone.id}
                type="button"
                disabled={!editable}
                className={`mk${weight} ${side}${edge}`}
                style={{ left: `${pct(milestone.date)}%` }}
                title={`${milestone.text} · ${label}`}
                aria-label={editable ? `Edit ${milestone.text}, ${label}` : `${milestone.text}, ${label}`}
                onClick={() =>
                  // The panel lives in the footer, a long way from here in the
                  // tree. An event beats threading state up through the page
                  // for one interaction.
                  window.dispatchEvent(
                    new CustomEvent("moment:edit", { detail: milestone.id }),
                  )
                }
              >
                <i />
                <span className="mk__l">
                  <b>{milestone.text}</b>
                  <span>{label}</span>
                </span>
              </button>
            );
          })}

          {metInside && (
            <span className="gl gl--met" style={{ left: `${pct(met)}%` }}>
              <b>Us</b>
            </span>
          )}

          {/* The caps name the actual ends of the line, whatever they are now. */}
          <span className="cap2 cap2--a">{formatDate(new Date(start).toISOString())}</span>
          <span className="cap2 cap2--b">
            {endsToday ? "Today" : formatDate(new Date(end).toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
}
