# Spec

State of the prototype as of 9 August 2026. Written as a handoff, so a fresh session can
pick this up without re-reading the build transcript.

Read alongside:

- **`DECISIONS.md`** — what Marko actually decided. The authoritative file. Read it first.
- **`PRODUCT.md`** — who it is for, voice, anti-references. Mostly assistant-proposed.
- **`DESIGN.md`** — the current visual system. Assistant-proposed, revised three times.

---

## What it is

A private website for Marko and his girlfriend holding a timeline of milestones, a photo
gallery, and a log of trips. One shared password, no user accounts. She does not know it
exists yet; the first view is a surprise, after which it becomes an ongoing archive that both
of them add to.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router), React 19.2 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4, tokens in `src/app/globals.css` |
| Fonts | Bricolage Grotesque (display), Archivo (body), via `next/font` |
| Storage | Filesystem locally, Vercel Blob when deployed |
| Hosting | Not yet deployed. Vercel assumed |

Note: Next.js 16 renamed `middleware.ts` to **`proxy.ts`**. Anything written for Next 15 or
earlier will be wrong about this.

## Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Hero, "Lately" strip, interlude, photo pile, marquee, section links |
| `/login` | Static | The password gate |
| `/logout` | Dynamic | POST, clears the session cookie |
| `/add` | Static shell | Upload form, posts to a Server Action |
| `/timeline` | Static | Chronological list. Empty state until content exists |
| `/gallery` | Static | Uneven photo grid. Empty state until content exists |
| `/trips` | Static | Empty state only. **Not built** |

## Auth

- One shared password in `SITE_PASSWORD` (`.env.local`, gitignored). Currently
  `change-me-please`, never changed.
- `src/proxy.ts` redirects any unauthenticated request to `/login`, matching everything
  except `_next/static`, `_next/image`, `favicon.ico`, and `/login`.
- Session is an HMAC-SHA256 token in an httpOnly, SameSite=Lax cookie, 60 days.
- The `/add` Server Action **re-checks the session itself** rather than trusting the proxy,
  because Server Actions are public endpoints.

**Not production-grade.** No rate limiting on the login form, so the password is
brute-forceable. Fine for a link shared with one person; worth fixing before it is public.

## Storage

`src/lib/storage/` behind a `PhotoStore` interface, selected at runtime:

- `BLOB_READ_WRITE_TOKEN` present → Vercel Blob.
- Otherwise → local filesystem (`public/photos/uploads/`, manifest at `data/moments.json`).

Both paths are gitignored. This exists because **deployed filesystems are read-only**, so the
local implementation cannot survive deployment.

### To deploy

Marko must do these; the assistant cannot create accounts or handle keys.

1. Create a Vercel Blob store in the Vercel dashboard.
2. Add `BLOB_READ_WRITE_TOKEN` to the project's environment variables.
3. Add `SITE_PASSWORD` as an environment variable too.

The code switches automatically. The Blob adapter has **never been run**.

## Image handling

`images.unoptimized: true` in `next.config.ts`, deliberately.

The Next image optimizer fetches source files server-side, without the visitor's session
cookie, so `proxy.ts` redirects it to `/login` and optimization fails with a 400. The
alternative was excluding `/photos` from the gate, which would make every personal photograph
readable by anyone who guessed a filename.

Consequence: full-size images are served to the browser. Acceptable for a handful of photos,
not for hundreds. **The real fix** is an authenticated image route that checks the session and
streams a resized file, which would let optimization back on without opening up `public/`.

## Verified working

Confirmed in a real browser, not assumed:

- Login with correct and incorrect passwords; session persists across routes; logout clears it.
- The gate genuinely blocks `/photos/*` for unauthenticated requests (returns 307).
- Photo pile advances on click; live counter ticks every second without hydration mismatch.
- All images load; no horizontal overflow at 375px or 1280px.
- Contrast: every text/background pair measured against real sRGB values, all pass WCAG AA.
- `tsc --noEmit`, `eslint`, and `next build` all clean.

## Not verified, or broken

1. **Uploads have never successfully saved.** The code typechecks and the form renders, but
   the one end-to-end attempt navigated away mid-submit and wrote nothing to disk. Unproven
   end to end. **This is the top thing to fix.**
2. **The Vercel Blob adapter has never executed.** No token has ever been present.
3. **Nothing has been seen visually.** The screenshot tool timed out on every attempt for the
   whole session. All design verification was computational. This is almost certainly why the
   palette needed three attempts.
4. **`/trips` is a stub.** No data model, no content.
5. **No tests exist.** Zero coverage, against a stated 80% standard.
6. **`prefers-reduced-motion` is written but never exercised.**

## Placeholder content

None of this was chosen by Marko. Replace freely.

- Partner name is the literal string `"Partner"`.
- `togetherSince` is `2024-01-01`.
- All 11 photographs are stock, from Lorem Picsum.
- Marquee place names are invented.
- Timeline captions are invented.

## Open questions

1. Her actual name, and the real date they got together.
2. Does `/trips` need a map, or is it a list of places with photos and notes?
3. Should uploads support multiple files at once? One-at-a-time will be tedious for a backlog.
4. Should either of them be able to delete or edit an entry? Currently append-only.
5. Does she get the same password, or her own?
6. Is there a deadline, an anniversary or occasion the reveal is aimed at?

## Suggested order for the next session

1. Set up a working screenshot script (Playwright) so design can actually be seen and
   iterated. Everything visual is unreliable until this exists.
2. Get uploads working end to end and prove it by adding a real photo.
3. Settle the visual direction against real screenshots before building more surface.
4. Replace placeholder identity: real name, real date, a few real photos.
5. Then design `/trips`.
