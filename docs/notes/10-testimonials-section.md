# 10 — Testimonials

**Commit:** `feat: build Testimonials section`
**Files:** `src/components/sections/Testimonials.tsx`

## What this does

Four patient testimonial cards: star rating, quote, avatar, name, and
location — the most straightforward section so far, and mostly a chance to
reinforce the patterns already established rather than introduce new ones.

## What's reused, not new

- **Data-driven cards** from the `testimonials` array in
  [02](02-site-data-module.md) — one `.map()`, no repeated JSX.
- **`Reveal variant="fade"`** from [06](06-reveal-component-and-approach-section.md)
  for both the header and each card.
- **`next/image` with explicit `width`/`height`** from
  [05](05-hero-section.md)'s avatar pattern, since each avatar is a small
  fixed-size circle rather than a `fill`-sized container.

## One detail worth noting: the star rating is just text

`{ stars: "★★★★★" }` in the data is a plain string of star characters, not
an icon component or a computed 1–5 loop. For a fixed, always-5-star
display this is the simplest thing that works — no icon library, no SVG,
no loop. It would need to become a real computed rating (`"★".repeat(n) +
"☆".repeat(5 - n)`, or an accessible icon component) the moment ratings
become dynamic — e.g. once real reviews start coming from a database
instead of hardcoded data.
