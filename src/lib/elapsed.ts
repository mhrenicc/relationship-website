const MS = { second: 1000, minute: 60_000, hour: 3_600_000, day: 86_400_000 };

export type Elapsed = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function elapsedSince(sinceIso: string, now: Date = new Date()): Elapsed {
  const diff = Math.max(0, now.getTime() - new Date(sinceIso).getTime());
  return {
    days: Math.floor(diff / MS.day),
    hours: Math.floor((diff % MS.day) / MS.hour),
    minutes: Math.floor((diff % MS.hour) / MS.minute),
    seconds: Math.floor((diff % MS.minute) / MS.second),
  };
}
