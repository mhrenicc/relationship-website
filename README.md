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

## Start here

This is a **prototype**. Read the docs before the code, in this order:

1. **[`DECISIONS.md`](DECISIONS.md)** — what Marko actually decided, including three reversals
   and the pattern behind them. Authoritative.
2. **[`SPEC.md`](SPEC.md)** — current state: what works, what is unverified, what is broken,
   and the open questions.
3. **[`PRODUCT.md`](PRODUCT.md)** — users, purpose, voice, anti-references. Proposed, not decided.
4. **[`DESIGN.md`](DESIGN.md)** — the visual system and its measured contrast ratios. Proposed.

Two things to know immediately: **uploads have never successfully saved**, and **nothing has
ever been verified visually** because the screenshot tooling failed throughout. See `SPEC.md`.

## Notes

- Never commit `.env.local` — it holds the real password.
- Built on Next.js 16, which renamed `middleware.js` to `proxy.js` — see `src/proxy.ts`.
- The site is marked `noindex` in `src/app/layout.tsx`.
