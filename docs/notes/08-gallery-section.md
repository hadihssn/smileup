# 08 — Before & after gallery

**Commit:** `feat: build Before & After gallery`
**Files:** `src/components/sections/Gallery.tsx`

## What this does

Four cards, each split into two square tiles labeled "before" and "after."

## Key concept: faking before/after with one photo

There's only one photo per gallery item in the data
([site.ts](../../src/data/site.ts)) — the "before" and "after" tiles render
the *same* image twice, and the visual difference comes entirely from a CSS
filter on the "before" tile:

```tsx
className="object-cover brightness-95 contrast-90 grayscale"
```

`grayscale` removes color, and the slightly reduced `brightness`/`contrast`
mutes it further, reading as a duller "before" photo next to the same image
shown in full color as "after." This is a placeholder technique carried
over from the design prototype (see `design-reference/`) — real before/after
photography would replace this with two genuinely different photos and
drop the filter entirely.

## Why `Reveal variant="scale"` here instead of `"fade"`

The other sections use the default fade-and-slide-up reveal. Gallery cards
use `variant="scale"` (defined back in
[01](01-fonts-and-design-tokens.md)'s CSS: `[data-reveal="scale"]` starts
at `scale(0.94)` instead of an offset position). It's a small variation
that gives these cards a slightly different "settle into place" motion,
which fits their grid-of-photos presentation better than a directional
slide.
