# Us

A private site for us — timeline, gallery, trips. Next.js (App Router) + TypeScript + Tailwind.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set SITE_PASSWORD to something real
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` first — the whole site sits behind a single shared password (`SITE_PASSWORD` in `.env.local`), enforced in `src/proxy.ts`.

## Structure

- `src/app/page.tsx` — homepage (hero + links to the sections below)
- `src/app/timeline` — milestones (stub for now)
- `src/app/gallery` — photos (stub for now)
- `src/app/trips` — travel log (stub for now)
- `src/app/login` — password gate
- `src/lib/site-config.ts` — names, "together since" date, tagline — edit this first
- `src/lib/auth.ts` — session cookie signing/verification
- `src/proxy.ts` — redirects unauthenticated requests to `/login`

## Photos

Placeholder images live in `public/photos/`. Replace the files with real ones, keeping the same
filenames, and update the alt text in [`src/lib/site-config.ts`](src/lib/site-config.ts). No other
code needs to change.

Photos sit **behind the password gate**, same as every page. That is deliberate: excluding them
would make personal photographs readable by anyone who guessed a filename.

One consequence: Next.js image optimization is turned off (`images.unoptimized` in
`next.config.ts`). The optimizer fetches source files server-side without the visitor's session
cookie, so the gate redirects it and optimization fails. Serving files directly keeps them gated,
because the browser request does carry the cookie.

This is fine for a handful of photos. Once there are hundreds, the fix is an authenticated image
route that checks the session and streams a resized file, rather than opening up `public/`.

## Design

[`PRODUCT.md`](PRODUCT.md) holds strategy (who it's for, voice, anti-references) and
[`DESIGN.md`](DESIGN.md) holds the visual system (palette with verified contrast ratios,
typography, motion rules). Read both before changing how anything looks.

## Notes

- Never commit `.env.local` — it holds the real password.
- Built on Next.js 16, which renamed `middleware.js` to `proxy.js` — see `src/proxy.ts`.
- The site is marked `noindex` in `src/app/layout.tsx`.
