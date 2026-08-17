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
  const start = new Date(met).getTime();
  const span = new Date(today).getTime() - start;
  if (span <= 0) return null;

  const pct = (iso: string) => ((new Date(iso).getTime() - start) / span) * 100;
  const days = Math.round(span / 86_400_000);

  const startYear = new Date(met).getFullYear();
  const endYear = new Date(today).getFullYear();
  const years = Array.from({ length: endYear - startYear }, (_, i) => startYear + 1 + i)
    .map((year) => ({ year, x: pct(`${year}-01-01`) }))
    .filter(({ x }) => x > 1 && x < 99);

  const ordered = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

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

            return (
              <span
                key={milestone.id}
                className={`mk${weight} ${side}${edge}`}
                style={{ left: `${pct(milestone.date)}%` }}
                title={`${milestone.text} · ${formatDate(milestone.date)}`}
              >
                <i />
                <span className="mk__l">
                  <b>{milestone.text}</b>
                  <span>{formatDate(milestone.date)}</span>
                </span>
              </span>
            );
          })}

          <span className="cap2 cap2--a">{formatDate(met)}</span>
          <span className="cap2 cap2--b">Today</span>
        </div>
      </div>
    </div>
  );
}
