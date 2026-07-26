# 01 — Fonts and design tokens

**Commit:** `feat: add design tokens and fonts (Poppins + Inter)`
**Files:** `src/app/layout.tsx`, `src/app/globals.css`

## What this does

The design calls for two fonts — Poppins for headings, Inter for body text —
plus a small palette of brand colors (greens, ink, muted text, borders,
footer tones) that get reused across every section. Rather than typing hex
codes everywhere, we define them once as tokens and reference them by name.

## Key concepts

**`next/font/google`** — Next.js downloads Google Fonts at build time and
self-hosts them from your own domain, instead of the browser fetching them
from Google at runtime. Two benefits: no extra network request to a
third-party, and no "flash of invisible text" while the font loads. Each font
call returns a `variable` (a CSS custom property name), which we attach to
the `<html>` element's `className`. That makes the font available anywhere
in the app via `var(--font-poppins)` / `var(--font-inter)`.

```tsx
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: [...] });
// ...
<html className={`${poppins.variable} ${inter.variable}`}>
```

**Tailwind v4's `@theme` block** — Older Tailwind versions configured
colors/fonts in a `tailwind.config.js` file. Tailwind v4 moved this into CSS
itself: anything declared inside `@theme { ... }` in `globals.css`
automatically becomes a utility class. Declaring `--color-brand: #00b900;`
means `bg-brand`, `text-brand`, and `border-brand` all exist immediately —
no config file, no build step to wire it up.

We also map `--font-heading` and `--font-body` to the font variables from
`next/font`, so components can just write `font-heading` / `font-body`
instead of repeating `var(--font-poppins)` everywhere.

**`[data-reveal]` CSS** — The original design fades/slides sections into
view as you scroll. That's a CSS transition on an `opacity`/`transform`
pair, toggled by a `.is-revealed` class. The class gets added by JavaScript
(an `IntersectionObserver` — see [02](02-site-data-and-hooks.md)), but the
*animation itself* is plain CSS, defined once here instead of inline on
every element.

## Why tokens instead of inline hex codes

Once colors are tokens, changing the brand green later means editing one
line in `globals.css` instead of hunting through every component. It also
documents intent: `bg-section` communicates "this is the light-green section
background" far better than `bg-[#f2fbf2]` would.
