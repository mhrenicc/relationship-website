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
| Routes | `/`, `/add`, `/gallery`, `/trips`, `/trips/[id]`, `/sets/[id]/edit`, `/bucketlists`, `/deleted`, `/login`, `/logout` |
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
- Dumping photographs into a trip, and deleting one photograph from a trip.
- Adding photographs to an existing entry from its Edit page.
- Editing a moment by clicking its mark on the ribbon; month-precision dates.
- Uploading a 10MB photograph from the browser: downscaled and stored as three
  variants in about five seconds.

## What happened in the session of 18 August

Deployment is live and real data is going in. The session was mostly bugs found
by using it on a phone, plus one refactor.

**A wipe, and its root cause.** Adding a moment destroyed every moment before
it. The mechanism was general and affected every collection: each write is
read-modify-write of one whole JSON document, so any read that returns empty
when the document is not empty turns the next append into a wipe. Two causes,
both fixed: `read` swallowed JSON parse failures and returned `[]`, and a null
from `get()` was treated as "never written" when it is indistinguishable from
"exists but could not be fetched" — `list()` is now asked, and the read throws
rather than guessing. A write that would shrink a collection is refused unless
the caller opts in, which only the purge does; that part is a tripwire, not the
fix.

**The storage design is still the deeper issue.** Whole-document
read-modify-write has no atomicity and no versioning, which is also why
`records.ts` documents that two simultaneous edits can lose one. Per-record
blobs would remove the class entirely but turn one read per collection into one
per record on a page that reads five, so it was judged the wrong trade. Revisit
if it recurs — with the repository in place it is now a change to one file.

**Photo uploads never worked from a phone.** Next caps a Server Action body at
1MB by default and Vercel near 4.5MB regardless; a phone photograph is 3-5MB.
Photographs are now downscaled in the browser to a 2800px long edge and
uploaded **one at a time**, which removes the ceiling rather than raising it.
`bodySizeLimit` is 4mb purely for headroom.

~~**`addPhotos` on the set editor still posts a whole batch in one request.**~~
Fixed. Adding photographs to an existing entry now downscales in the browser
and posts one photograph per request, like every other upload path. Verified
against two 2.7MB 4032x3024 photographs — 5.4MB together, over the ceiling the
old code hit.

`addSet` in `src/app/add/actions.ts` — the whole-batch version `/add` used
before the split — has been deleted. Nothing called it, and leaving it there
invited wiring a form back to the broken shape.

## Known problems, in priority order

1. ~~**Photo quality is poor.**~~ Fixed. There is now a third variant, `full`
   at 2800px, and the hero uses it; `display` stayed at 1600px for feed cards
   and trip covers; `thumb` went 400 → 480. Quality is per-variant in
   `src/lib/storage/variants.ts`. Every read goes through `photoSrc(photo,
   variant)`, which falls back down to a smaller variant, because records
   written before a variant existed do not have it.

   Two consequences worth knowing:

   - **Only new uploads improve.** Originals are not retained — only the WebP
     variants are — so nothing can be re-derived. The four stock uploads in
     the local store keep their old quality, and any future quality change
     will need a re-upload too. This is another reason to deploy before
     loading real photographs.
   - **Capacity is roughly a third of what it was.** A 4032px phone photo now
     stores about 1.4 MB across the three variants, so 1 GB holds about 670
     photographs rather than 2,000. If that becomes the binding constraint,
     the levers are R2 (no egress charge) or dropping `full` to ~2200px.
2. ~~**No edit or delete anywhere.**~~ Done. Every card carries an Edit/Delete
   pair that appears on hover; `/sets/[id]/edit` and `/trips/[id]/edit` do the
   editing; `/deleted` restores.

   **Deleting never destroys.** It sets `deletedAt` and every read filters it
   out. Reads go through `src/lib/records.ts` — a raw `store.read` returns
   deleted rows, which is the one way to put ghosts back on the site. Stored
   image files are never removed, not even by Erase.
3. **`/gallery` still wears the old design.** It is the last route that does.
   It now carries edit/delete controls, so a rebuild must keep them.
4. ~~**`/lists` does not exist.**~~ Done, and renamed: they are **bucketlists**
   now, at `/bucketlists`. Start a list, add lines to it, tick them off,
   remove a line, delete the list. Restoring is under Bucketlists in
   `/deleted`. The homepage band is a preview of the two newest and links
   through; "Open the list →" anchors to that list.

   Items have no deleted state of their own — one line is small enough that a
   soft delete would cost more than it saves, and the list around it is still
   recoverable whole.
5. ~~**Milestones cannot be created.**~~ Done. "Add to timeline" in the
   homepage footer opens a corner panel: text, date, and a significant toggle.
   Significant moments are the large marks that always show their name;
   everything else is a quiet dot you hover to read, which is what lets the
   ribbon carry years of small things without becoming a wall of labels.
   Deleting is in the same panel; restoring is under Moments in `/deleted`.
   Clicking a mark on the ribbon opens the panel on that moment to edit it —
   the mark dispatches a `moment:edit` event rather than the page threading
   state down to two distant components.

   A moment can be dated to a **month** instead of a day, for a trip over
   several days or when the day is long gone. `date` stays a full ISO day so
   ordering and positioning need no special cases: a month-precision moment is
   stored on the **15th**, which is what puts it mid-month on the line. Only
   the label changes. `precision` is absent on older records and reads as
   "day".
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
- **A trip's banner draws only from favourited photographs**, re-picked on
  every visit. `/trips/[id]` must stay `force-dynamic` or the pick freezes and
  the feature disappears without any error.
- **Ticking a bucketlist line is optimistic, in both places.** The write hits
  blob storage, rewrites the whole document and revalidates three routes —
  about two seconds deployed. Anything that waits for that reads as broken and
  invites a second click on something that already worked. The homepage band
  and the list page each apply the change immediately and let the write follow;
  a failed write is discarded by React and the box snaps back.
- **The heart is per photograph, and records no person.** One shared password
  means the site cannot tell who clicked.
- **`/timeline` is retired.** The ribbon replaced it.
- **Everything reaches storage through `src/lib/repo.ts`.** Actions say
  `repo.moments.add(...)`, never `store.read`/`store.write`. Nothing outside
  that file may import `records.ts` or call `getPhotoStore()` — six hand-rolled
  copies of read-append-write is what allowed the wipe. Imported as a namespace
  because named imports kept colliding with local variables.
- **A trip supplies its own metadata.** Dumping photographs into a trip asks
  for nothing: the caption is the trip name and the date is its start, so the
  record keeps the same shape as any other set. Grouping them into sets within
  a trip is deliberately **parked** — they land as a flat list, which is what
  the trip page renders anyway.
- **A trip is named by where it was.** There is no separate title field; the
  location field is the name. Cards suppress the location line when it just
  repeats the title.
- **Ticking a bucketlist line is optimistic in both places.** The write takes
  about two seconds deployed; anything that waits for it reads as broken.
- **Moments can be dated to a month.** `date` stays a full ISO day and a
  month-precision moment is stored on the **15th**, which is what puts it
  mid-month on the ribbon. Only the label changes.
- **`home.css` element selectors are scoped to `.homeui`.** Next keeps a
  route's stylesheet in the document across client-side navigations, so a bare
  `nav` rule restyled every page reached from the homepage. Any page importing
  `home.css` must wrap its content in that class.
- **Phone overrides live at the end of `home.css`.** They override rules
  defined above and CSS resolves ties by source order; a media query placed
  earlier silently loses.
- **"Posting as" is a label, not authentication.** One shared password means
  either person could post as the other.

## Deployment

**It is deployed and in use**, at `relationship-website-three.vercel.app`,
building from `main`. Real data is going in.

**The Blob store is private.** That was a deliberate choice: a photograph's URL
is worthless to anyone who has not unlocked the site, where a public store's
URL works forever once shared or leaked. The cost is that a private blob cannot
be fetched by URL at all, so `save` returns an app path and
`/media/[...key]` streams the bytes after checking the session. Writes must
pass `access: "private"` — passing `"public"` to a private store fails every
write with a 500, which cost an evening to find.

Two Vercel behaviours worth knowing, both of which looked like bugs in this
code:

- Environment variables are injected **at build time**, so connecting a store
  requires a redeploy before the running app can see it.
- A Server Action ID is baked into each build, so a page loaded from an older
  deploy posts an ID the new server does not know and gets a **404**. A hard
  refresh fixes it. This is not a routing problem.

**Never write the real password into this repo.** It is public. The password
lives only in `.env.local` (gitignored) and in the hosting project's
environment variables.

**Deploy before loading real photographs.** Local uploads write to the
filesystem; production writes to Blob. They are separate stores and nothing
migrates between them.

Resized, 1 GB holds roughly 670 photographs; unresized it would hold about 250.
Exceeding the free tier removes access for 30 days rather than issuing a bill.

## Parked deliberately

- **Grouping photographs within a trip.** They land as a flat list on purpose.
  Sorting them into sets happens in the app later, because doing it at upload
  time on a phone is what stops a backlog going up at all. Marko's words: "lets
  make that decision next time".
- **Written notes**, sticky-note style. Out of v1 since the design session.
- **Retaining originals on upload.** Offered and not yet done. Without it, any
  future change to variant sizes or quality means re-uploading everything,
  because only the WebP variants are kept.
- **An export.** There is still no backup of anything except Vercel's own copy.
  Both of these were flagged as protecting the data he is now entering, and
  both are still outstanding.
- **Per-record storage.** See the wipe notes above.

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

- **Never use his data as a test fixture.** A photograph was deleted from a
  real trip to test a delete control. It was recoverable only because
  `removePhoto` leaves the files on disk and the orphans could be matched back
  to their batch by file timestamp. Create test content first, and remove it
  after.
- **Verify with realistic inputs.** Upload was declared working against
  flat-colour JPEGs that compressed to 71KB, which never approached the 1MB
  request limit that broke every real photograph. Generate noise at real
  dimensions, or use a genuine file.
- **Fix the general defect, not the reported case.** Marko is explicit about
  this: a guard around the symptom he noticed leaves the cause in place to
  resurface elsewhere.

- Screenshots: use the `claude-in-chrome` tools. The in-app browser pane times
  out on screenshot.
- The automation browser produces no frames, so `requestAnimationFrame`
  callbacks, IntersectionObserver callbacks and CSS transitions do not advance
  there. Scroll-triggered behaviour cannot be verified that way — read computed
  styles with transitions disabled, and ask Marko to confirm.
- `npx next build` regenerates the `LayoutProps` global types; a bare
  `tsc --noEmit` after deleting `.next` will fail on them spuriously.
