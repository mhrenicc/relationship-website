import type { StoredMilestone } from "@/lib/storage";

/**
 * Moments can be dated to a day or only to a month.
 *
 * A month-precision moment is stored on the 15th so every consumer — sorting,
 * ribbon positioning, the deleted view — treats it as an ordinary date and
 * lands it in the middle of its month. Only the label distinguishes the two.
 */
export type Precision = "day" | "month";

const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** How a moment's date reads. */
export function formatMoment(moment: Pick<StoredMilestone, "date" | "precision">): string {
  const date = new Date(moment.date);
  return moment.precision === "month" ? MONTH.format(date) : DAY.format(date);
}

/** `2026-08` from a stored date, for prefilling a month input. */
export function toMonthValue(iso: string): string {
  return iso.slice(0, 7);
}

/** A month input's value becomes the 15th; a day input passes straight through. */
export function toStoredDate(value: string, precision: Precision): string {
  return precision === "month" ? `${value}-15` : value;
}
