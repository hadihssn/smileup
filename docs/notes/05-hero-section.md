# 05 — Hero section

**Commit:** `feat: build hero section with animated stat counters`
**Files:** `src/components/sections/Hero.tsx`, `next.config.ts`

## What this does

The two-column hero: eyebrow badge, headline, subtext, two CTAs, the
animated stat row, and a photo with a floating testimonial card overlay.

## Key concepts

**`next/image` and `remotePatterns`.** `next/image` resizes, optimizes, and
lazy-loads images automatically — but for security, it refuses to fetch
from a domain you haven't explicitly allow-listed. That's what the change
in `next.config.ts` does:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
}
```

Without this, `<Image src="https://images.unsplash.com/...">` would throw
at request time. This also documents, in one place, every external image
host the app depends on — useful later when the placeholder Unsplash photos
get replaced with real clinic photography (at which point this list
shrinks to nothing, since local files in `public/` don't need it).

**`fill` vs explicit `width`/`height`.** The hero photo uses
`<Image fill className="object-cover" />` inside a `relative aspect-[4/5]`
container — `fill` makes the image stretch to match its parent's box
(hence the parent needs a defined size/aspect-ratio and `position:
relative`). The small avatar photo instead uses explicit
`width={40} height={40}`, since it's a fixed, known size rather than
"fill whatever space is available." Both approaches let Next.js know the
image's dimensions ahead of time, which is what prevents layout shift when
the image loads.

**`sizes` prop.** Tells the browser how wide the image will actually be
rendered at different viewport widths, so it can request an
appropriately-sized file instead of always downloading the largest one:

```tsx
sizes="(min-width: 1240px) 620px, 90vw"
```

**Reusing `useCountUp`.** The stats row is exactly the hook from
[03](03-scroll-reveal-and-count-up-hooks.md) wired to three target numbers:

```tsx
const { ref: statsRef, values } = useCountUp([12, 6000, 4.9]);
const [years, patients, rating] = values;
```

Each render formats its own number — `Math.round(years)}+`,
`Math.round(patients).toLocaleString()}+"`, `rating.toFixed(1)}★` — rather
than the hook trying to know about years/patients/rating formatting itself.
That keeps the hook generic (just "animate these numbers") and lets the
component own presentation.

## A note on testing this in an automated browser

While verifying this in the automated preview browser, the stat counters
froze partway (e.g. "0+" years) instead of finishing at "12+". The cause:
`document.hidden` was `true` for that tab, and browsers intentionally
pause `requestAnimationFrame` on hidden/backgrounded tabs to save battery —
so the animation genuinely can't run to completion in that harness. It's
not a bug in the app; the same code runs to completion normally in a real,
foregrounded browser tab. Worth knowing as a general lesson: if an
animation "freezes" only in headless/automated testing, check
`document.visibilityState` before assuming the code is wrong.
