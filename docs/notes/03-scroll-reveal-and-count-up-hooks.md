# 03 — Scroll-reveal and count-up hooks

**Commit:** `feat: add scroll-reveal and count-up hooks`
**Files:** `src/hooks/useReveal.ts`, `src/hooks/useCountUp.ts`

## What this does

Two small reusable hooks that power the site's two scroll-triggered
animations:

- `useReveal()` — fades/slides/scales an element in in the CSS classes
  defined in [01](01-fonts-and-design-tokens.md), toggled on as it enters
  the viewport (and off again if it scrolls back out).
- `useCountUp(targets)` — animates a set of numbers from 0 up to their
  final values once, the first time the element scrolls into view. Used
  for the hero's "12+ years / 6,000+ patients / 4.9★" stats.

## Key concepts

**Why `"use client"` at the top of these files.** By default, every
component in the Next.js App Router is a *Server Component* — it renders on
the server and ships zero JavaScript to the browser for that component.
That's great for performance, but it means it can't use `useState`,
`useEffect`, or browser-only APIs like `IntersectionObserver`, because there
is no browser involved yet when it renders. The `"use client"` directive
marks a file as a *Client Component*, opting into interactivity at the cost
of shipping its JavaScript to the browser. Any component that needs to
react to scrolling, clicks, or state has to be (or be inside) a Client
Component — that's why both hooks, and every component that calls them,
need the directive.

**`IntersectionObserver`** — the browser API both hooks are built on. You
give it a callback and a `threshold` (0.15 = "fire once 15% of the element
is visible"), and it calls your callback whenever that visibility crosses
the threshold, both entering and leaving. This is far cheaper than the old
approach of listening to `scroll` events and calculating positions
manually — the browser does the geometry for you.

**`requestAnimationFrame` + easing** — `useCountUp` doesn't jump straight
to the target number. It samples `performance.now()` on each animation
frame, computes how far through the animation duration it is (`progress`,
0 to 1), and runs that through an easing function:

```ts
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
```

An easing function reshapes a linear 0→1 timeline into a more natural
curve — `easeOutCubic` starts fast and decelerates near the end, which
reads as more "alive" than a constant-speed count. `requestAnimationFrame`
schedules the next `tick` in sync with the browser's repaint, which is
smoother and more battery-friendly than `setInterval`.

**Custom hooks as reusable behavior.** Both are plain functions prefixed
`use...` that call other hooks (`useRef`, `useEffect`, `useState`) inside
them — that's the entire definition of a "custom hook" in React. Extracting
this logic here means any component can opt into the same reveal/count-up
behavior with one line (`const ref = useReveal()`), instead of duplicating
the `IntersectionObserver` setup in every section.
