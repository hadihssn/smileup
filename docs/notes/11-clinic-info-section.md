# 11 — Clinic info and map

**Commit:** `feat: build Clinic Info section with map embed`
**Files:** `src/components/sections/ClinicInfo.tsx`

## What this does

A two-column section: address/phone/WhatsApp/email/hours on the left, an
embedded Google Map on the right.

## Key concepts

**A plain `<iframe>`, not a maps SDK.** Embedding Google Maps here doesn't
need an API key, a JavaScript SDK, or a React wrapper library — just the
public embed URL in an `<iframe src="...">`. That's the right level of
complexity for "show a static map of one address": reach for the Maps
JavaScript SDK only if the page needs interactive features (custom
markers, directions, search) that an iframe can't do.

```tsx
<iframe title="Clinic location map" src={contact.mapEmbedSrc} loading="lazy" />
```

`title` is required for accessibility (screen readers announce it), and
`loading="lazy"` defers loading the map until it's about to scroll into
view — free performance for a below-the-fold, resource-heavy embed.

**Opening hours as one row per day.** The design explicitly lists all seven
days individually (Monday–Sunday) rather than collapsing repeats into a
range like "Mon–Fri: 9–7." That's a content decision from the handoff, not
a technical one — but structurally it's the same pattern as everything
else: a `hours` array in `site.ts` mapped into rows, so adding a holiday
hours override later is a data change, not a markup change.

**`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))` for a
two-column layout that stacks.** Same technique as the Services grid
([07](07-services-section.md)), just applied to two columns instead of
many cards — at typical desktop widths there's room for two 320px+ columns
side by side, and on narrow screens it collapses to one column with no
extra media query needed.
