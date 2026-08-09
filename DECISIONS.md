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
- `togetherSince` is `2024-01-01`, a placeholder. The real date has not been given.
- All photographs are stock, from Lorem Picsum.
- Place names in the marquee are invented Croatian and Central European cities.
