# Handoff

Written 16 August 2026, at the end of the design session. Start here.

Read next: **`DECISIONS.md`** (what Marko actually chose — authoritative) and
**`SPEC-V1.md`** (the content model, storage and going-live plan).

---

## Where the work happens now

**In the app, at `localhost:3000`.** Nowhere else.

```bash
npm run dev
```

The design mockup in `design/` is **retired**. It did its job — it caught three
rejected palettes cheaply — but it has been fully ported and keeping it alive
means two sources of truth. It is kept only as a historical reference. Do not
edit it, and do not design in it.

`design/serve.py` on port 8899 is no longer needed.

## What exists

| | |
|---|---|
| Framework | Next.js 16.3 App Router, React 19, TypeScript strict |
| Styling | `src/app/globals.css` (tokens, Tailwind v4) + `src/app/home.css` (the ported design) |
| Routes | `/`, `/add`, `/gallery`, `/trips`, `/login`, `/logout` |
| Storage | `src/lib/storage/` behind `PhotoStore`; filesystem locally, Vercel Blob when `BLOB_READ_WRITE_TOKEN` exists |
| Local data | `data/*.json` and `public/photos/uploads/` — both gitignored |

**Homepage components** live in `src/components/home/`: `Hero`, `HomeNav`,
`Feed`, `Trips`, `Places`, `PlacesRail`, `Lists`, `Ribbon`.

**Old components still used by `/gallery`**: `SectionShell`, `Nav`. The
homepage no longer uses `PhotoStack`, `PlacesMarquee` or `TimelineStrip` —
those are dead and can go once `/gallery` is rebuilt.

## What works, verified in a browser

- Login, session, logout.
- Upload: several photographs become **one set**, resized to a 400px thumb and
  a 1600px display variant in WebP, EXIF orientation applied, written to the
  store, rendered on `/` and `/gallery`.
- Trips: created from `/trips`, photographs attached via `/add?trip=<id>`, with
  an "also show in the feed" toggle defaulting on.
- Places: added from the map rail, geocoded through Nominatim, pinned on the
  map, marked visited. Filters and pin highlighting work.
- The whole homepage design: hero with scroll departure, content-shaped feed,
  trips, map, lists band, ribbon.

## Known problems, in priority order

1. **Photo quality is poor.** Marko's words, and he is right. The display
   variant is capped at 1600px at WebP quality 78. That is thin for a
   full-bleed hero on a 1536px screen, and the hero additionally scales 1.12×
   on scroll. Likely fix: a larger variant (2400px+) used by the hero only, and
   a higher quality setting. **This is the top thing to fix.**
2. **No edit or delete anywhere.** Everything is append-only. Marko has asked
   for edit and delete next.
3. **`/gallery` still wears the old design.** It is the last route that does.
4. **`/lists` does not exist.** The homepage links to it and the section
   renders placeholder lists; there is no page and no way to create a list.
5. **Milestones cannot be created.** The ribbon renders them, nothing writes
   them.
6. **Places added before geocoding existed** have `lat: null` and show as
   "Needs a location" with no way to fix them. A re-geocode action would clear
   this.
7. **No tests at all**, against a stated 80% standard. Knowingly carried.
8. **No rate limiting on login.** Fine for a private link, not for public.

## Decisions that are easy to get wrong

- **A set is several photographs with one caption.** Not one photo per entry.
- **`inFeed` defaults to true.** Siloing trip content is the failure mode.
- **Placeholder content is decided per collection**, not globally. Adding a
  first real place while there are no photographs must show that place.
- **Records store an opaque `key`, not just a URL.** This is what keeps
  switching storage provider a config change rather than a migration. Nothing
  outside `src/lib/storage/` may learn a provider-specific detail.
- **The hero shows the newest set's lead photograph.** Marko was surprised by
  this; it is deliberate but worth revisiting.
- **`/timeline` is retired.** The ribbon replaced it.
- **"Posting as" is a label, not authentication.** One shared password means
  either person could post as the other.

## Deployment

**Nothing is deployed. No Vercel project exists.** Marko must:

1. Create the Vercel project from `mhrenicc/relationship-website` (private).
2. Create a Blob store, copy `BLOB_READ_WRITE_TOKEN`.
3. Set `BLOB_READ_WRITE_TOKEN` and `SITE_PASSWORD` — the password is still
   `change-me-please`.

**Deploy before loading real photographs.** Local uploads write to the
filesystem; production writes to Blob. They are separate stores and nothing
migrates between them.

Ship resize improvements before any bulk upload: unresized, 1 GB holds roughly
250 photographs; resized, roughly 2,000. Exceeding the free tier removes access
for 30 days rather than issuing a bill.

## Still unanswered

1. Her real name and the real date. Still `"Partner"` and `2024-01-01` in
   `src/lib/site-config.ts`.
2. Palette: current saturation versus the lower-chroma variant. Best judged
   against real photographs, which do not exist yet.
3. Whether entries can be edited or deleted — Marko has now asked for this, so
   treat it as decided and design it.
4. Vercel Blob versus Cloudflare R2. Deferrable; R2 charges nothing for egress,
   which is the constraint that actually bites.

## Working notes

- Screenshots: use the `claude-in-chrome` tools. The in-app browser pane times
  out on screenshot.
- The automation browser produces no frames, so `requestAnimationFrame`
  callbacks, IntersectionObserver callbacks and CSS transitions do not advance
  there. Scroll-triggered behaviour cannot be verified that way — read computed
  styles with transitions disabled, and ask Marko to confirm.
- `npx next build` regenerates the `LayoutProps` global types; a bare
  `tsc --noEmit` after deleting `.next` will fail on them spuriously.
