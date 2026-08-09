# Design

The current visual system. **Assistant-proposed, not decided by Marko** except where
`DECISIONS.md` says otherwise. It has been rebuilt three times; read the reversal history in
`DECISIONS.md` before changing direction, so the next attempt does not repeat a rejected one.

Marko's directives that constrain everything here: **vibrant and colourful, cohesive with a
real rhythm, soft rather than hard-edged, smooth transitions.** Explicitly rejected: dark and
cinematic; four unrelated hues at equal weight; hard outlines and blocky offset shadows.

---

## Colour

**One analogous family, violet 305° through amber 70°.** Every colour is a neighbour of the
next. This is the fix for "no rhythm": hierarchy comes from **lightness**, not from hue
variety. Adding more distinct hues is what broke the previous attempt.

| Token | Value | Role |
|---|---|---|
| `--violet` | `oklch(0.50 0.20 305)` | Deep accent, gradient start |
| `--rose` | `oklch(0.56 0.22 352)` | Primary accent, links |
| `--coral` | `oklch(0.57 0.185 32)` | Gradient end |
| `--amber` | `oklch(0.82 0.15 70)` | Warm highlight |
| `--wash-*` | `L 0.95–0.965, C 0.035–0.04` | Section surfaces, same four hues lifted |
| `--paper` | `oklch(0.99 0.004 340)` | Page |
| `--ink` | `oklch(0.26 0.055 320)` | Text |
| `--ink-soft` | `oklch(0.47 0.045 325)` | Secondary text |

The page carries two large fixed radial gradients so it is never flat white behind content.

### Verified contrast, measured in-browser

| Pair | Ratio | Needs | |
|---|---|---|---|
| `--ink` on `--paper` | 15.44 | 4.5 | Pass |
| `--ink-soft` on `--paper` | 6.81 | 4.5 | Pass |
| `--ink-soft` on `--wash-violet` | 5.98 | 4.5 | Pass |
| `--ink` on wash rose / coral / amber | 13.6–14.1 | 4.5 | Pass |
| white on `--violet` | 6.65 | 4.5 | Pass |
| white on `--rose` | 5.25 | 4.5 | Pass |
| `--rose` link on `--paper` | 5.11 | 4.5 | Pass |

Two values are pinned by contrast and must not be lightened:

- `--coral` is held at L 0.57. At 0.64 white text on the tail of `.grad-warm` measured 3.66.
- An earlier `--flare` at L 0.62 measured 4.02 on the login button and was rejected.

**Re-measure after any palette change.** Do not eyeball it: both failures above looked fine.

## Typography

- **Bricolage Grotesque** — display. Characterful and slightly irregular, which carries the
  playfulness without novelty fonts.
- **Archivo** — body. Neutral grotesque, stays out of the way.

Paired on a contrast axis. Both were chosen partly because the obvious picks (Fraunces, Inter,
Playfair, Cormorant, DM Sans, Instrument Serif) are saturated training-data defaults; the
first build used two of them.

Fluid `clamp()` scale, ratio ≥1.25. Display ceiling 5.75rem. Letter-spacing floor -0.03em.
`text-wrap: balance` on headings, `pretty` on prose.

## Surface and depth

Soft, never hard-edged. This is a hard constraint from Marko.

- Radius `1.25rem`, `1.75rem` for larger surfaces.
- Two diffused, hue-tinted shadows: `--shadow-soft` resting, `--shadow-lift` on hover.
- **Banned:** 2px outlines as a style, solid offset shadows (`6px 6px 0 0`), and anything else
  that reads as neo-brutalism. It was tried and rejected as cartoonish.
- Sections use `.wash`, a vertical gradient that fades in and out of the page, so they blend
  rather than butting against a hard rule.
- `.grad-warm` (violet → rose → coral) is the signature. Emphasis only, never body text.

## Imagery

**Photographs are the design.** A photo site with colour blocks where images belong is a bug.

- No uniform square grid, ever. That is the Instagram anti-reference. Sizes are cycled so the
  grid stays uneven.
- Photos behave like physical objects: the pile tilts and stacks, cards lift on hover.
- Alt text is content, not compliance.

## Motion

- Ease-out expo. No bounce, no elastic. `--duration-quick` 260ms, `--duration-slow` 900ms.
- **`transition-all` is banned.** Name the properties. Animate `transform` and `opacity`;
  `filter`, `clip-path`, and tinted shadow are allowed when they earn it.
- Reveals must enhance an already-visible default, so a renderer that skips animation still
  shows a complete page. Never gate content behind a transition.
- `prefers-reduced-motion` is honoured globally and the marquee falls back to a static
  scrollable row. Written, but never actually exercised.

## Interactive states

Every clickable element ships **hover, focus-visible, and active**. All three, no exceptions.
Focus-visible is a 3px violet ring. Active states matter on touch, where hover does not exist.

## Discipline

- No default framework palette colours. Everything resolves to a token here.
- No arbitrary spacing. Use `--space-*` or the fluid scale.
- Check `public/photos/` and existing tokens before inventing anything.

## Visual verification

**Currently the weakest part of this project.** Nothing in this file has been confirmed by
looking at it; the screenshot tool failed for the entire build session and every check was
computational. That is the most likely reason the palette needed three attempts.

Before further design work: get a Playwright screenshot script running against localhost, then
render, compare, fix, and render again, at least twice. Be specific when comparing ("heading is
46px, should read nearer 40px"), not vague. When screenshots are genuinely unavailable, say so
plainly rather than implying a visual check happened.
