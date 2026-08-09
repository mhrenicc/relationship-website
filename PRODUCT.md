# Product

## Register

brand

## Users

Two people: Marko and his girlfriend. That is the entire user base, and it never grows.

She arrives first as a surprise — she does not know this exists. Her first session is on a phone, handed to her or sent as a link, with Marko probably watching her face. Every subsequent session is casual: late evening, phone in hand, revisiting something specific or showing a friend one photo.

He arrives as the maintainer. His job is adding things — a trip that just happened, photos from last weekend, a milestone worth marking — without the act of adding feeling like data entry.

The job to be done: remember well. Not to store files, not to organize an archive. To make the good parts easy to return to.

## Product Purpose

A private site holding the record of one relationship: a timeline of milestones, a gallery of photos, and a log of trips taken together.

It exists because the alternative is a camera roll — everything present, nothing findable, no shape to any of it. Photos scattered across phones do not add up to a story. This does.

Two phases, and the design must serve both:

1. **The reveal.** One moment, one time, unrepeatable. She opens the link, types a password only she would guess, and sees it. This is the product's highest-stakes surface and it happens exactly once.
2. **The archive.** Years of casual returns. It must stay good on the four-hundredth visit, and must absorb new content without degrading.

Success at reveal: she is quiet for a second before she says anything. Success at archive: it still gets opened, unprompted, a year later.

## Brand Personality

**Intimate, playful, unmistakably theirs.**

> Revised after the first build read as a gallery. "Understated" was taken too literally and produced a museum: beautiful, reverent, and cold. A museum is about other people's things. This is about theirs, and they are allowed to be funny in it.

Voice: specific, dry, never sentimental. It names the actual place, the actual date, the actual dumb argument. It does not describe feelings the photo already shows. If a line could appear on a greeting card, it is wrong. If a line would make her snort, it is right.

The humour is theirs, not performed. Inside jokes, petty tallies, things only the two of them would find funny. There is no audience, so nothing needs explaining.

Playful means **physical**, not decorated. Photographs behave like objects: they stack, tilt, and get shuffled through, because that is what photographs do on a table. It never means hearts, doodles, or novelty fonts. The line: a pile of snapshots you flick through is playful, a scrapbook sticker is twee.

Restraint still governs the interface. The site stays quiet so the content can be loud.

## Anti-references

All four were named explicitly, and all four are hard bans:

- **Wedding invitation.** No blush pink, no script or calligraphic fonts, no gold foil, no watercolor florals, no monogram crests.
- **Instagram feed.** No uniform square photo grid. Equal-sized tiles in endless rows are the absence of a decision. Photos must be sequenced, sized, and paced with intent.
- **Corporate / SaaS site.** No rounded card grids, no generic geometric sans, no hero-metric blocks, nothing that could belong to any startup.
- **Twee scrapbook.** No hearts, no doodles, no washi tape, no torn-paper edges, no handwriting fonts, no cutesiness of any kind.

Two more, inherited from the direction chosen:

- **Cream, sand, beige, parchment.** The warm near-white body background is the current default look of generated design. This project's prior iteration used exactly that and is being replaced because of it.
- **Any romance-category visual cliché.** If the aesthetic is guessable from the words "couple's website," it has failed.

## Design Principles

1. **The reveal is the product.** The gate and the first screen after it carry more weight than every other surface combined. They get designed first and hardest, and they only fire once.

2. **Photographs are the only color.** The interface is ink and near-black. Every bit of chroma on screen should come from the images themselves. An interface that competes with the photos has misunderstood its job.

3. **Specific beats sentimental.** Real dates, real place names, real details. The site never tells them how to feel about a memory they were present for.

4. **Built to be added to.** Every layout must look deliberate with three entries and with three hundred. Empty states are part of the design, not a fallback. If adding a photo is tedious, the archive dies.

5. **Understatement is the affection.** Anything decorative is a candidate for deletion. What remains should feel weighty, physical, and quiet — like a bound album on a dark table, not a webpage about one.

## Accessibility & Inclusion

- WCAG 2.2 AA as the floor. Body text ≥4.5:1, large text ≥3:1, verified rather than assumed. A dark palette makes low-contrast body copy the likeliest failure, so it gets checked explicitly.
- `prefers-reduced-motion` honored on every animation, with a crossfade or instant fallback. Content is never gated behind a reveal transition.
- Full keyboard navigation with visible focus states. Photo viewers must be escapable and arrow-navigable.
- Every image carries meaningful alt text. This is a photo site; alt text is content, not compliance.
- Phone-first. The reveal happens on a phone and most visits will be on one.
