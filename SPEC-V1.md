# Spec — v1

What the site holds, how it behaves, and what is deliberately left out. Written
16 August 2026, after the design was settled against real screenshots.

Read alongside **`DECISIONS.md`** (what Marko actually chose — authoritative) and
**`design/`** (the mockup this spec describes). Where this file and `SPEC.md`
disagree, this one is newer: `SPEC.md` describes the pre-redesign prototype.

---

## Content types

Five were agreed. Notes are deferred; the other four are v1.

### Photo moment ("set")

The core type. A set is **several photographs, one caption, one date**.

| Field | Notes |
|---|---|
| `id` | Opaque key, not a URL. See *Storage*. |
| `photos[]` | One or more. Order matters; the first is the lead. |
| `caption` | One line for the whole set. |
| `date` | The day it happened, not the day it was uploaded. |
| `addedBy` | `"marko"` or `"partner"`. |
| `tripId` | Optional. Set when added from inside a trip. |
| `inFeed` | Whether it also appears in the main feed. Defaults **true**. |

Alt text is **derived from the caption** with an optional per-photo override, so
the add form never asks for the same sentence twice. This keeps the WCAG floor
without adding a required field.

Uploading takes **multiple files at once**. One-at-a-time was rejected as the
thing that would kill the archive: a backlog becomes data entry.

### Trip

A trip is a **container you create and then add into** — not a filter over
existing photos, and not derived from dates.

| Field | Notes |
|---|---|
| `id`, `name` | |
| `places[]` | Free text, e.g. `["Split", "Hvar"]`. |
| `start`, `end` | Date range. |
| `note` | Optional. |

Anything added inside a trip carries the `inFeed` toggle, **default on**, so trip
content is never siloed. The trip add form and the main add form are the same
component, pre-scoped.

**No map inside a trip in v1.** Places is its own section with the map.

### Place

| Field | Notes |
|---|---|
| `id`, `name`, `country` | |
| `lat`, `lon` | Required to pin. |
| `been` | Boolean. Toggled from the list rail. |

New places added by name need geocoding to get coordinates. **Unresolved:** which
geocoder. Until then the add form must not silently drop a pin in the wrong
place — it should mark the entry as needing a location.

### Milestone

A date and one line, no media. Milestones do **not** appear in the feed; they
live on the ribbon at the foot of the homepage.

### List

A named list of items. Each item has text, a `done` flag, and `addedBy`.

### Deferred

**Written notes**, sticky-note style. Out of v1.

---

## Identity and auth

**One shared password.** Both partners use the same one; the gate is a single
password field.

The add form carries a **"posting as" choice**, remembered per device so it is
not a fresh decision every upload. This is a self-declared label, not
authentication — either person could post as the other. That is acceptable for a
two-person site and should not be mistaken for access control.

Existing behaviour that stays: HMAC-SHA256 session token in an httpOnly,
SameSite=Lax cookie, 60 days; `src/proxy.ts` redirects unauthenticated requests
to `/login`; the `/add` Server Action re-checks the session itself rather than
trusting the proxy, because Server Actions are public endpoints.

**Known weakness:** no rate limiting on the login form, so the password is
brute-forceable. Acceptable for a link shared with one person; fix before it is
public.

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Hero, feed, trips with the map attached, lists, ribbon |
| `/login`, `/logout` | The gate |
| `/add` | Upload; also reachable pre-scoped to a trip |
| `/gallery` | Every set |
| `/trips` | Every trip; a trip opens to its own contents |
| `/lists` | Every list |

`/timeline` is **retired as a destination**. The ribbon at the foot of the
homepage replaced it.

Navigation is a **top bar** on every page — transparent over the hero, light
surface once scrolled past. A sidebar was considered and rejected.

---

## Homepage structure

Hero → feed → trips (map attached) → lists → ribbon.

Three rules do the unifying, and they matter more than any single layout choice:

1. **One surface.** A single document-length gradient. Sections declare no
   background of their own, except the one saturated Lists band.
2. **One module vocabulary.** Everything carrying a photograph uses the same
   radius, the same two soft shadows, and a caption below. Trips are the same
   card, larger.
3. **Only Trips and Lists announce themselves**, with display headings. The feed
   has no heading; the map has a small sub-label because it is an add-on to
   Trips.

**The feed shows photo sets only**, newest first. Each entry's footprint is
derived from its content — photo count and lead orientation choose the grid span
and height — so the run reshapes itself as the archive grows rather than
repeating a designed rhythm.

The feed uses dense grid packing, which pulls a later entry forward when the next
does not fit. Tidier composition, occasionally out of strict date order. Known
trade-off, reversible.

**The ribbon** is the whole history as one horizontal line at the foot: strictly
proportional, no clamping, milestones labelled and alternating above and below,
resting at half opacity and resolving on hover or focus.

---

## Storage

`src/lib/storage/` behind a `PhotoStore` interface, selected at runtime by
whether `BLOB_READ_WRITE_TOKEN` is present. Local filesystem otherwise.

**Two rules that keep the provider swappable:**

- Nothing outside `src/lib/storage/` may learn a provider-specific detail. The
  moment a component assumes a URL shape, the swap stops being contained.
- Records store an **opaque key, not a URL**. The adapter resolves keys to URLs.
  Storing URLs means a provider change requires rewriting every record.

**Resize on upload**, before anything is stored: a thumbnail (~400px), a display
size (~1600px), and optionally the original. This is the single most important
piece of infrastructure here — see *Limits*.

Trips, places, lists and milestones need their own persistence. None exists yet;
they live only in the mockup.

### Limits

Vercel Blob on Hobby: **1 GB storage, 10 GB transfer per month**. Exceeding a
limit **removes access for 30 days** rather than issuing a bill — the failure
mode is a dead link, not a charge.

- Unresized phone photos are 3–5 MB, so 1 GB is roughly **250 photos**.
- Resized to ~450 KB, 1 GB is roughly **2,000**.

Transfer is the tighter constraint, because `images.unoptimized: true` is set —
Next's optimizer cannot fetch through the password gate. A 100-photo gallery at
full size is ~400 MB per view, or about 25 page loads a month. With thumbnails it
is ~4 MB per view.

**The fix for both:** an authenticated image route that checks the session and
streams a resized variant. That also lets optimization back on without exposing
`public/` to anyone who guesses a filename.

**Unresolved:** Vercel Blob versus Cloudflare R2. Starting on Blob. R2 charges
nothing for egress, which is the constraint that actually bites. Deferrable
precisely because of the two rules above.

---

## Going live

Deploy **before** loading real content. Local uploads write to the filesystem;
production writes to Blob. They are separate stores and nothing migrates between
them, so filling the site locally means uploading everything twice.

Marko must do these; they involve accounts and keys:

1. Create the Vercel project from the GitHub repo.
2. Create a Blob store, copy `BLOB_READ_WRITE_TOKEN`.
3. Set `BLOB_READ_WRITE_TOKEN` and `SITE_PASSWORD` in project environment
   variables. The password is still `change-me-please`.

Then: verify with two or three photos, ship resize-on-upload, then load the
backlog. Deployed does not mean revealed — the gate applies in production and
she does not have the URL.

---

## Placeholder content

None of this was chosen by Marko. Replace without asking.

- Partner name is the literal string `"Partner"`. **Unresolved:** her real name.
- `togetherSince` is `2024-01-01`. **Unresolved:** the real date.
- Every photograph is stock, hotlinked from Unsplash in the mockup.
- Captions, trip names, place lists and list items are invented.

`heroPhoto` and `memoryPool` in `src/lib/site-config.ts` are **not** displaced by
uploads the way `moments` is — they stay stock until either replaced by hand or
made store-driven. Store-driven is the intent.

---

## Unresolved

1. Her real name, and the real date.
2. Palette: current saturation versus the lower-chroma variant in
   `design/v1-dusty.html`. Best judged against real photographs.
3. Geocoding for new places.
4. Blob versus R2.
5. Whether entries can be edited or deleted. Currently append-only.
6. Whether there is an occasion the reveal is aimed at.

## Explicitly out of scope for v1

Written notes. Per-trip maps. Rate limiting. Editing and deletion. Any second
account or per-person login. Tests — there are none, against a stated 80%
standard, and that gap is knowingly carried.
