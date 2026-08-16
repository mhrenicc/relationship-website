export type Photo = {
  src: string;
  alt: string;
};

export type Moment = Photo & {
  /** ISO date. Drives the label and the ordering of the timeline strip. */
  date: string;
  caption: string;
};

export const siteConfig = {
  partnerOne: "Marko",
  partnerTwo: "Partner",
  togetherSince: "2024-01-01",
};

/**
 * Everything below is placeholder content. Replace the files in
 * `public/photos/` and rewrite the text; no component needs to change.
 */

export const heroPhoto: Photo = {
  src: "/photos/hero.jpg",
  alt: "Replace with the photograph that should open the site.",
};

/** The pool the shuffle draws from. Add as many as you like. */
export const memoryPool: Photo[] = [
  { src: "/photos/one.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/four.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/five.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/six.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/seven.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/eight.jpg", alt: "Replace with a photograph you both like." },
  { src: "/photos/nine.jpg", alt: "Replace with a photograph you both like." },
];

/** Newest last. The strip reverses this so the most recent reads first. */
export const moments: Moment[] = [
  {
    date: "2024-02-14",
    caption: "The first proper trip",
    src: "/photos/two.jpg",
    alt: "Replace with a photograph from an early trip.",
  },
  {
    date: "2024-06-02",
    caption: "That week it did not stop raining",
    src: "/photos/three.jpg",
    alt: "Replace with a photograph from a rainy week away.",
  },
  {
    date: "2024-09-19",
    caption: "The long drive back",
    src: "/photos/ten.jpg",
    alt: "Replace with a photograph from a long drive home.",
  },
  {
    date: "2025-01-08",
    caption: "Cold, and worth it",
    src: "/photos/six.jpg",
    alt: "Replace with a photograph from a cold day out.",
  },
  {
    date: "2025-05-30",
    caption: "Nothing planned, best day of the month",
    src: "/photos/nine.jpg",
    alt: "Replace with a photograph from an unplanned day.",
  },
];

/** Place names for the marquee. Keep them short; they scroll. */
export const places = [
  "Rovinj",
  "Vienna",
  "Plitvice",
  "Trieste",
  "Zadar",
  "Ljubljana",
  "Budapest",
  "Split",
];

export const sections = [
  {
    href: "/gallery",
    title: "Gallery",
    blurb: "The photographs worth keeping, not all of them.",
  },
  {
    href: "/trips",
    title: "Trips",
    blurb: "Every place we went, and what it was actually like.",
  },
] as const;
