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

## Notes

- Never commit `.env.local` — it holds the real password.
- Built on Next.js 16, which renamed `middleware.js` to `proxy.js` — see `src/proxy.ts`.
