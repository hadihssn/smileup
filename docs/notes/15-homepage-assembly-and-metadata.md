# 15 — Homepage assembly and metadata

**Commit:** `feat: assemble homepage and metadata`
**Files:** `src/app/page.tsx`, `src/app/icon.svg`, `src/app/layout.tsx` (metadata, from [01](01-fonts-and-design-tokens.md))

## What this does

By this point `page.tsx` already reads as the whole site, one line per
section, in the order from the design's spec:

```tsx
<Navbar />
<main>
  <Hero /> <Approach /> <Services /> <Gallery /> <Dentist />
  <Testimonials /> <ClinicInfo /> <Booking /> <Faq />
</main>
<Footer />
<WhatsAppButton />
```

This commit's actual new work is the favicon — replacing
`create-next-app`'s default icon with the SmileUp brand mark.

## Key concept: why sections were wired into `page.tsx` as they were built

Note that `page.tsx` didn't get built in one final "assembly" step —
`Hero` was added to it back in [05](05-hero-section.md), `Approach` in
[06](06-reveal-component-and-approach-section.md), and so on, one line per
commit as each section was finished. The alternative — building all
eleven section components first, then wiring them into `page.tsx` in one
big commit at the end — would mean the app doesn't actually run (or run
correctly) until that last commit lands. Keeping `page.tsx` up to date
in every commit means `npm run dev` shows real, incremental progress at
every step, and `git bisect` (finding which commit introduced a bug, by
testing midpoints) would always land on a working build.

## The `icon.svg` file convention

Next.js treats a handful of filenames in `app/` as special — `icon.svg`
(or `.png`/`.tsx`) is one of them. Just by existing at `src/app/icon.svg`,
Next.js automatically serves it at `/icon.svg` and injects the right
`<link rel="icon">` tag into every page's `<head>` — no manual wiring in
`layout.tsx` needed. This is the same "file location defines behavior"
convention behind `page.tsx` (defines a route) and `layout.tsx` (defines a
shared wrapper); `icon.svg` is a metadata file convention rather than a
route or layout, but follows the same pattern of "Next.js looks for known
filenames and treats them specially."

The icon itself reuses the navbar's brand mark (green circle, white "S"),
just as static SVG markup — simple enough not to need Next's
`ImageResponse` dynamic-icon-generation API, which exists for icons that
need to be computed from data (e.g. rendering a user's initials) rather
than being a fixed design asset.
