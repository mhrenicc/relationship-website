> **RETIRED — 16 August 2026.** Fully ported into the app. Kept as history
> only. Do not edit these files and do not design in them; all work now
> happens in `src/` at localhost:3000. See `HANDOFF.md`.

# Design mockups

Static HTML mockups used to settle the visual direction before it is built in
the Next.js app. **Nothing here ships.** They exist so a design can be looked at
and reacted to, which the prototype could not do for its first three attempts.

| File | What it is |
|---|---|
| `v1.html` | The current homepage mockup |
| `v1-dusty.html` | Same page with lower-chroma tokens, for comparing palettes |
| `phone.html` | Renders `v1.html` in 390px iframes so mobile media queries actually fire |
| `serve.py` | Static server that sends `no-store`, because browser caching repeatedly served stale copies |

## Running them

```bash
cd design && python serve.py
```

Then open `http://localhost:8899/v1.html`.

A plain `python -m http.server` will appear to work and then serve you a cached
page after every edit. Use `serve.py`.

## Dependencies

The mockups are not self-contained and need internet:

- Photographs are hotlinked from Unsplash (licensed for this use). They are
  placeholders and none of them ship.
- The world map draws coastlines from `world-atlas` TopoJSON via d3, using
  `geoNaturalEarth1`. Pins run through the same projection as the coastlines, so
  alignment is exact by construction rather than by calibration. Two stock map
  images were tried first and both were wrong — one put Gibraltar in Algeria.
- Fonts come from Google Fonts.

In the real build the map should be pre-rendered to static SVG rather than
pulling d3 and a TopoJSON file at runtime.

## Known placeholder content

Partner name, dates, captions, trip names, place lists and list items are all
invented. See `DECISIONS.md` for what Marko actually chose versus what was
assumed.
