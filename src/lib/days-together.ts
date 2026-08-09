const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysTogether(sinceIso: string, today: Date = new Date()): number {
  const since = new Date(sinceIso);
  const diff = today.getTime() - since.getTime();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}
