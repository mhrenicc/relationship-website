# Design

## Theme

Dark. Not as a style preference, as a consequence of the scene:

> She opens the link at night, in bed, phone at low brightness, lights off, not expecting anything.

A light interface in that moment is a flashbang. The reveal happens in the dark, so the site is built for the dark.

The surface is a green-cast near-black: **moss on wet stone, forest floor at dusk.** It is inky and botanical rather than red and velvet. This matters, because the obvious "not blush-and-cream" answer for a couple's site is oxblood plus an italic serif, and that is its own cliché. A green-black base is unfamiliar in this category, and it makes skin tones, sunlight, and water in photographs read warmer by contrast than a red-black base ever would.

**Color strategy: Committed, inverted.** The dark surface carries 90% of the screen. Chroma comes almost entirely from the photographs. The interface is deliberately the least colorful thing on the page.

## Color

OKLCH throughout. Seed hue 140° anchors the primary.

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(0.16 0.014 145)` | Page. Near-black, green cast. |
| `--surface` | `oklch(0.21 0.018 145)` | Raised panels, inputs. |
| `--surface-hi` | `oklch(0.26 0.020 145)` | Hover, borders on raised elements. |
| `--moss` | `oklch(0.30 0.096 140)` | Primary. Seed color. Living shadow, not a button color. |
| `--lichen` | `oklch(0.86 0.090 135)` | Accent. The single point of light. Used sparingly. |
| `--ink` | `oklch(0.96 0.008 140)` | Body and headings. |
| `--ink-muted` | `oklch(0.68 0.020 140)` | Metadata, dates, secondary copy. |
| `--line` | `oklch(0.30 0.012 145)` | Hairlines. |

### Verified contrast (WCAG 2.2 AA)

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| `--ink` on `--bg` | ~13.2:1 | 4.5:1 | Pass |
| `--ink-muted` on `--bg` | ~6.8:1 | 4.5:1 | Pass |
| `--lichen` on `--bg` | ~10:1 | 3:1 | Pass |
| `--ink` on `--moss` | ~8.3:1 | 4.5:1 | Pass |

`--ink-muted` is deliberately lighter than a designer's instinct for "muted." Low-contrast gray body text on a dark surface is the single most common failure in dark palettes, and it is the reason most dark sites are unreadable in daylight.

## Typography

Two families, paired on a real contrast axis (serif vs grotesk), never two of a kind.

- **Spectral** (Production Type) — display and long-form. Screen-native serif with genuine literary weight. Reads as a bound book, not a wedding invitation. Light 300 at large sizes is quietly filmic; the italic is used for single words, never full paragraphs.
- **Archivo** — metadata, navigation, dates, UI. A sturdy grotesque that stays out of the way.

Rejected by procedure, not taste: Fraunces, Playfair, Cormorant, Instrument Serif, Inter, DM Sans. All are training-data defaults, and the previous iteration of this site used two of them.

No monospace anywhere. This brand is not technical; mono would be costume.

### Scale

Fluid `clamp()`, ratio ≥1.25 between steps. Line-height on the dark surface runs 0.05 higher than a light-theme equivalent, because light type on dark reads as lighter weight and needs the air.

Ceiling on display type is 6rem. Letter-spacing floor is -0.03em. `text-wrap: balance` on headings, `pretty` on prose.

## Imagery

**Photographs are the design.** A photo site with no photos is a bug, not restraint.

- Full-bleed and near-full-bleed imagery carries every major surface.
- **No uniform square grid, ever.** That is the Instagram anti-reference, and equal tiles in equal rows is the absence of an editorial decision. Photos are sized by significance: a landscape gets width, a portrait gets height, the important one gets a full screen.
- Placeholders ship as real photographs, never colored rectangles. They live in `public/photos/` so the site works offline and Marko replaces files rather than editing code.
- Alt text is content. "The last morning in Rovinj, before the ferry" beats "beach photo".

## Layout

- Asymmetric and paced. Generous separation between movements, tight grouping within them.
- One dominant idea per fold. Long scroll, deliberate rhythm.
- Fluid spacing via `clamp()`, not fixed breakpoint jumps.
- Phone-first: the reveal happens on a phone.

## Motion

One well-orchestrated reveal beats scattered micro-interactions.

- The gate-to-site transition is the only ambitious motion on the site. It fires once and it is the product.
- No fade-in-on-scroll applied uniformly to every section. That is the tell.
- Content is never gated behind a transition. Reveals enhance an already-visible default, so a headless renderer or a background tab still shows a complete page.
- Ease-out expo. No bounce, no elastic.
- `prefers-reduced-motion` is honored everywhere, with a crossfade or instant fallback.

## Depth

Surfaces sit on one of three planes. Nothing floats without a reason, and nothing shares a plane by accident.

| Plane | Surface | Used for |
|---|---|---|
| Base | `--bg` | The page itself. |
| Raised | `--surface` | Inputs, strips, anything the eye should read as sitting on top. |
| Floating | `--surface-hi` + shadow | Only what genuinely lifts: hover states, an active card in a stack. |

On a near-black background a pure-black shadow is invisible, so elevation cannot be faked the usual way. Depth comes from three things instead: a lighter surface step, a hairline in `--line`, and a shadow tinted toward the palette's own hue rather than neutral black. Flat one-step shadows (`shadow-md` and friends) are banned; if a shadow is used it is layered, low-opacity, and tinted.

## Interactive states

Every clickable or focusable element ships **hover, focus-visible, and active**. All three, no exceptions. A control with only a hover state is unfinished, and focus-visible is not optional because the whole site is keyboard-reachable.

- `:focus-visible` uses the `--lichen` ring defined in `globals.css`. Never remove an outline without replacing it.
- Active states must be visible on touch, where hover does not exist.

## Motion properties

Name the properties being animated. **`transition-all` is banned** — it animates layout and paint properties by accident and is the usual cause of janky hover states.

Animate `transform` and `opacity` by default. `clip-path`, `filter`, `backdrop-filter`, and tinted shadow are permitted when they materially improve the effect and stay smooth. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, or `font-size`.

## Color and spacing discipline

- **No default framework palette colors.** No `blue-600`, no `indigo-500`, no stock Tailwind ramp. Every color resolves to a token in this file.
- **No arbitrary spacing.** Values come from `--space-*` tokens or the fluid `clamp()` scale. Random step-picking is what makes a layout feel assembled rather than composed.

## Existing assets first

Before inventing anything visual, check what the project already has: `public/photos/`, any logo or brand file, the tokens in `globals.css`. Real assets always beat generated stand-ins, and invented brand colors are never acceptable when defined ones exist.

## Visual verification

Design work is not done when it compiles. Render it, look at it, compare it against the intent, fix what is wrong, and look again. At least two passes.

Be specific when comparing: "heading is 46px, should read closer to 40px at this width", not "spacing feels off". Check spacing, type size and line-height, exact colors, alignment, radius, shadow, and image cropping.

When screenshots are unavailable, say so plainly and verify what can be verified computationally (contrast ratios, computed styles, overflow, load state) rather than claiming a visual check that did not happen.

## Components

- **Gate** (`/login`): a single centered field on near-black. No logo lockup, no card, no explanation. It should feel like a door, not a form.
- **Section shell**: shared chrome for Timeline / Gallery / Trips. Minimal top nav, no sidebar.
- **Photo figure**: image plus optional caption and date. The core repeating unit of the site.
- **Empty state**: designed, not a fallback. Every section must look intentional with zero entries, because most of them start that way.

## Bans specific to this project

Carried from PRODUCT.md anti-references, enforced in code review:

- No blush, no script fonts, no gold, no florals, no monogram.
- No uniform square photo grid.
- No rounded-card grids, no hero-metric blocks.
- No hearts, doodles, washi tape, torn-paper edges, handwriting fonts.
- No cream, sand, beige, parchment, or any warm near-white surface.
- No tiny uppercase tracked eyebrow above every section. The previous iteration used one on every card.
- No gradient text, no side-stripe borders, no decorative glassmorphism.
