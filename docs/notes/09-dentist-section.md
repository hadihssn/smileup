# 09 — Meet the Dentist

**Commit:** `feat: build Meet the Dentist section`
**Files:** `src/components/sections/Dentist.tsx`, `src/data/site.ts` (added `dentist`)

## What this does

A two-column section: Dr. Saad Aftab's portrait on the left, bio and three
info tiles (Qualification, Experience, Focus) plus a CTA on the right.

## Key concept: one-off content still deserves a data shape

[02](02-site-data-module.md) put *repeated* content (services, testimonials,
etc.) in `src/data/site.ts` as arrays. This section isn't a repeated list —
there's only one dentist — but the bio, photo, and credentials still moved
into a `dentist` object in that same file, rather than being typed directly
into the JSX:

```ts
export const dentist = {
  name: "Dr. Saad Aftab",
  photo: "...",
  bio: "...",
  qualification: "BDS, MDS (Prosthodontics)",
  experience: "12+ years in practice",
  focus: "Implants & Cosmetic Dentistry",
};
```

The reasoning is the same as before, just for a single record instead of a
list: this is exactly the kind of content the eventual admin dashboard (see
the project's long-term plans) would let the dentist edit directly — a
name, a bio, a photo. Keeping it as data now, even while it's hardcoded,
means the component doesn't change shape later when that data starts
coming from a database instead of a file.

## Left/right reveal pairing

This is the first section using both `Reveal` directional variants
together — the photo slides in from the left (`variant="left"`), the text
column from the right (`variant="right"`), so they visually converge
toward the center as you scroll to them. Same `Reveal` component from
[06](06-reveal-component-and-approach-section.md), just two different
`variant` values on either side of one `flex` row.
