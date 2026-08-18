# Decisions

**What this is:** a log of decisions **Marko actually made**, so a future rebuild does not
have to re-derive them or repeat rejected ideas.

**Scope rule, and it is strict.** Only things Marko explicitly asked for go in here. Things
the assistant inferred, defaulted to, or invented do **not**, no matter how well they worked.
Those live in `DESIGN.md` and `PRODUCT.md`, which are proposals, not instructions. When a
decision is reversed, the old entry stays with a strikethrough note, because the direction of
travel is itself information.

This project is a **prototype and scratchpad**. The value it hands to the real build is this
file.

---

## Standing decisions

| # | Decision | Said |
|---|---|---|
| 1 | A private website for Marko and his girlfriend: memories, trips, photos, "maybe interactive" | Session 1 |
| 2 | Folder name stays work-shaped, not cute: `relationship-website` | Session 1 |
| 3 | Password gate, one shared password, no user accounts | Session 1 |
| 4 | Experience-first, but **both of them add to it** over time | Session 1 |
| 5 | A surprise reveal first, then an ongoing archive | Session 1 |
| 6 | She does not know it exists yet | Session 1 |
| 7 | It must never read as: a wedding invitation, an Instagram feed, a corporate/SaaS site, or a twee scrapbook | Session 1 |
| 8 | Front page must be **interactive and varied**, not a few big pictures | Session 1 |
| 9 | **Playful**, not gallery-like | Session 1 |
| 10 | **Vibrant and colorful.** Explicitly not black, not cinematic | Session 1 |
| 10a | Vibrant must still be **cohesive**: colours need a rhythm and a hierarchy, not four unrelated hues at equal weight | Session 1 |
| 10b | **Soft, not hard-edged.** No cartoonish borders or blocky offset shadows. Smooth transitions and blends | Session 1 |
| 11 | There must be a real way to **upload photos** from the UI | Session 1 |
| 12 | It will be **deployed** so she can open a link, not run locally only | Session 1 |
| 13 | The frontend rules in Marko's own web-design CLAUDE.md apply (anti-generic guardrails, real interactive states, no `transition-all`, no default framework palette) | Session 1 |
| 14 | This repo is a prototype; decisions get logged here for the real build | Session 1 |
| 15 | Homepage is **one feed**, not stacked sections. Photo sets only in the feed | Session 2 |
| 16 | The map is **not** the centrepiece: an add-on beside/below Trips | Session 2 |
| 17 | Timeline is **not a section**: a horizontal ribbon at the very bottom, low opacity, "elegant to look at when we want to" | Session 2 |
| 18 | Trips and Lists **keep their big display headings**. The objection was to hard colour cuts, not to headings | Session 2 |
| 19 | Navigation stays a **top bar**. No sidebar | Session 2 |
| 20 | A photo entry is a **set**: several photographs, one caption, one date | Session 2 |
| 21 | Written notes **deferred** to a later update. Sticky-note style when they come | Session 2 |
| 22 | One shared password kept; the add form has a "posting as" choice | Session 2 |
| 23 | Sections must **blend**, not hard-cut into each other | Session 2 |
| 24 | The map must look **illustrated, not a satellite/radar image**. "The purple is not it" | Session 2 |
| 25 | Start on **Vercel**, switch storage later if it is not enough | Session 2 |
| 26 | **Deploy before loading real photos**, because local uploads never reach production | Session 2 |
| 27 | The design mockup is **retired**. All further work happens in the app | Session 2 |
| 28 | Photographs can be **dumped into a trip** with no title, date or per-photo anything — the trip supplies them | Session 3 |
| 29 | Grouping photographs within a trip is **parked** — they stay a flat list, sorting happens in the app later | Session 3 |
| 30 | A trip is **named by where it was**; no separate title field | Session 3 |
| 31 | The Blob store is **private**: a photograph's URL is useless without the password | Session 3 |
| 32 | Bucketlist lines are tickable **from the homepage band**, not only the list page | Session 3 |
| 33 | A moment can be dated to a **month** rather than a day; clicking its mark edits it | Session 3 |
| 34 | Storage is reached only through **repositories** — no hand-rolled read-append-write | Session 3 |
| 35 | **Fix root causes, not the reported case.** One-case guards around a noticed symptom are not acceptable | Session 3 |
| 28 | Everything must be **editable and deletable** from the UI — photos, captions, trips. Adding is not enough | Session 3 |
| 29 | Deleting must be **recoverable**, not immediate. A deleted thing is hidden, not destroyed | Session 3 |
| 30 | Deleting a trip **keeps its photographs**. The container goes, the contents stay | Session 3 |
| 31 | **Trips are a big part of the site** and get developed further than anything else | Session 3 |
| 32 | A trip opens its **own whole page**, view-only, with a small edit button in the corner | Session 3 |
| 33 | Photographs inside a trip can be **favourited by either person**, via a small heart in the corner | Session 3 |
| 34 | The trip page opens with a **banner of favourited photographs, re-randomised on every visit** | Session 3 |
| 35 | Trip photographs are **uncategorised for now**; us / places / food categories come later | Session 3 |
| 36 | Places can be **deleted from the map**, and hovering a pin shows its name | Session 3 |
| 37 | Adding to the timeline is a **small link in the footer corner**, beside "Add something" — never a whole screen | Session 3 |
| 38 | A moment is **text, date, and a significant toggle**. Nothing more | Session 3 |
| 39 | **Significant** moments show their name permanently; the rest are **dots you hover** to read | Session 3 |
| 40 | Lists are called **bucketlists** | Session 3 |

### The trip page, as described

Decisions 31–35 in his own framing, because the detail matters and a table row
loses it.

Clicking a trip on `/trips` opens a page for that trip alone. It is **view
mode, not an editing surface** — the editing lives behind a small button in the
corner, for when he wants to manage it.

The page has two parts:

1. **A banner at the top**, filling it the way the homepage hero does, showing
   a few favourited photographs picked at random. **The selection re-rolls on
   every visit**, so the same trip does not open the same way twice.
2. **Everything else below**, all the trip's remaining photographs in one
   uncategorised run, scrollable.

Favouriting is the mechanism that feeds the banner: a small heart in the corner
of a photograph, markable by either of them.

**Resolved, session 3.** His "a set of photos" meant *a few photos*, not the
stored `StoredSet` unit — and the banner shows them "hovering independently in
a nice way, not an actual pile". So the heart marks an **individual
photograph**, and the banner floats them separately rather than stacking them.

Categorisation (us / places / food) is explicitly **later**, not now.

## Reversed decisions

Kept deliberately. The reversals show the direction he keeps pushing.

| Was | Became | Note |
|---|---|---|
| ~~"Ink, not beige": deep oxblood or ink-black, tactile, photos as the only color~~ | Vibrant, colorful, light | Chose the dark option from a list, saw it built, rejected it as "too black and cinematic" |
| ~~Personality: "intimate, cinematic, understated"~~ | "Playful, vibrant, colorful" | Chose it from a list, then rejected the result as "too gallery like" |
| ~~Vibrant read as: four unrelated hues (yellow, teal, baby pink, lime) at equal lightness, hard 2px outlines, solid offset shadows~~ | Cohesive analogous palette, soft edges, gradient blends | "Too vibrant... all way out of place, and dont have a rithym... everything feels hardlined and cartoonish, i want smooth transitions" |

**Second pattern, worth as much as the first:** "vibrant" was read as *more separate colours*. It
actually meant *more energy in a coherent palette*. Saturation and variety are not the same
axis. The correct move is a tight, related hue family with real lightness hierarchy, not a
wider spread of hues. Neo-brutalist styling (hard outlines, blocky offset shadows) was never
asked for and read as cartoonish.

**Third reversal, session 2:** offered "design mockup first, then build" he initially
agreed, then rejected the result because localhost still showed the old prototype while
all the design lived in a throwaway HTML file. The lesson is not that mockups are wrong
— they were how three rejected palettes got caught cheaply — but that **the app must not
be allowed to drift behind them**. Port promptly or do not mockup at all.

**The pattern, stated plainly:** offered a choice between restrained and expressive, he picks
restrained on paper and rejects it on screen. Both reversals ran the same way, and neither was
a small adjustment. A future build should start louder than feels correct and pull back if
asked, rather than starting quiet and waiting to be pushed.

## Process decisions

- **This repo is a prototype.** Marko stopped the build deliberately to settle the idea in
  writing before more code. The next session should start from `SPEC.md` and this file, not
  from the code.
- **Design-doc split, as instructed:** only Marko's explicit directives go in this file.
  Assistant inferences live in `PRODUCT.md` and `DESIGN.md` and can be overruled freely.

## Rejected by name

- **The "Running total" tally** (petty scoreboard of invented couple stats). Assistant's idea,
  not Marko's. Called "cringe" and removed. Do not reintroduce invented inside jokes: humour
  has to come from the two of them or it does not go in.

## Open, and delegated to the assistant

Not Marko's decisions. A future build may revisit any of these freely.

- Tech stack (Next.js, TypeScript, Tailwind). He said "you decide."
- Everything about layout and composition: hero, scrolling strip, photo pile, marquee,
  section order.
- Every font and every specific colour value.
- Copy and captions throughout.
- Storage design for uploads.

## Placeholder content, not decisions

Currently in the repo and explicitly **not** chosen by Marko. Replace without asking.

- Partner name is literally `"Partner"`; the real name has not been given.
- ~~`togetherSince` is `2024-01-01`, a placeholder.~~ **Settled, session 3: 20 August 2021.**
  He gave "2021 august someday", then confirmed the year against the "Met" moment he had
  added himself — that moment's day and month were right and only its year was wrong. This
  is no longer placeholder content; it is his.
- All photographs are stock, from Lorem Picsum.
- Place names in the marquee are invented Croatian and Central European cities.
