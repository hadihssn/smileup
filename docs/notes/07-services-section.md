# 07 — Services grid

**Commit:** `feat: build Services grid`
**Files:** `src/components/sections/Services.tsx`

## What this does

Eight service cards (Teeth Whitening, Dental Implants, Braces & Aligners,
Root Canal, Veneers, Crowns & Bridges, Dental Cleaning, Cosmetic Dentistry)
in a responsive grid, each with a colored icon badge, title, and
description — reusing the `Reveal` component from
[06](06-reveal-component-and-approach-section.md) for the scroll-in
animation.

## Key concepts

**`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`.** This is
the CSS trick behind "however many cards fit per row, at whatever width
looks good" without a single media query. Read it as: *fit as many columns
as possible where each is at least 260px, and share the remaining space
equally (`1fr`) among them.* On a wide screen that's 4 columns of ~300px
each; on a phone it collapses to 1. `auto-fit` (vs `auto-fill`) also
collapses empty tracks, so columns stretch to fill the row rather than
leaving gaps when there are fewer items than would fit.

**Hover as a Tailwind variant, not JavaScript.** The lift-and-shadow effect
on hover is pure CSS: `transition-[box-shadow,transform] hover:-translate-y-1
hover:shadow-[...]`. No `onMouseEnter`/`onMouseLeave` state needed — the
browser already knows when the cursor is over an element, and CSS `:hover`
is both simpler and faster than re-rendering React to track it. This is
the same "let the right layer handle it" principle from
[04](04-navbar.md)'s CSS-breakpoint note: state that the browser natively
tracks (hover, focus, viewport size) belongs in CSS; state that only your
app knows about (is the menu open, did the form submit) belongs in React.

**Arbitrary values for exact design-spec numbers.** `p-[30px_26px]` and
`shadow-[0_16px_36px_rgba(0,150,0,0.16)]` use Tailwind's bracket syntax to
express values straight from the design spec that don't map to a
predefined class. Bracket syntax is what "opt out" of the design system
looks like — reach for it when spacing needs to match an exact reference
number, and reach for the plain scale (`p-6`, `gap-4`) everywhere else so
values stay consistent across the app by default.
