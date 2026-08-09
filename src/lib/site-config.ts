export type Photo = {
  src: string;
  alt: string;
};

export const siteConfig = {
  partnerOne: "Marko",
  partnerTwo: "Partner",
  togetherSince: "2024-01-01",
};

/**
 * Placeholder photography. Replace the files in `public/photos/` with real
 * ones and rewrite the alt text; nothing else needs to change.
 */
export const heroPhoto: Photo = {
  src: "/photos/hero.jpg",
  alt: "Replace with the photograph that should open the site.",
};

export const sections = [
  {
    href: "/timeline",
    title: "Timeline",
    blurb: "Everything that happened, in the order it happened.",
    photo: {
      src: "/photos/one.jpg",
      alt: "Replace with a photograph from an early milestone.",
    },
  },
  {
    href: "/gallery",
    title: "Gallery",
    blurb: "The photographs worth keeping, not all of them.",
    photo: {
      src: "/photos/two.jpg",
      alt: "Replace with a favourite photograph of the two of you.",
    },
  },
  {
    href: "/trips",
    title: "Trips",
    blurb: "Every place we went, and what it was actually like.",
    photo: {
      src: "/photos/three.jpg",
      alt: "Replace with a photograph from a trip you took together.",
    },
  },
] as const;
