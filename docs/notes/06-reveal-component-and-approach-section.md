# 06 — A shared `Reveal` component, and the Approach section

**Commit:** `feat: build Our Approach process section`
**Files:** `src/components/ui/Reveal.tsx`, `src/components/sections/Approach.tsx`

## What this does

The "Our Approach" section: an eyebrow/heading/paragraph header, plus a
4-step numbered grid (Listen & Assess → Plan Together → Treat with Care →
Stay in Touch). It's also the first section to need the scroll-reveal
animation on more than one element, which is what `Reveal` solves.

## Key concept: why a wrapper component instead of calling the hook in a loop

[03](03-scroll-reveal-and-count-up-hooks.md) built `useReveal()`, a hook
that returns a ref for *one* element. The Approach grid needs *four*
reveal-able cards — one per journey step. The tempting shortcut is calling
the hook inside the `.map()`:

```tsx
// Don't do this:
{journeySteps.map((step) => {
  const ref = useReveal(); // hook called a variable number of times
  return <div ref={ref}>...</div>;
})}
```

This breaks React's **Rules of Hooks**: hooks must run the same number of
times, in the same order, on every render, because React tracks hook state
by call order, not by name. A hook call inside `.map()` is fragile — if the
list length ever changes between renders, React's internal bookkeeping
desyncs, and ESLint's `react-hooks` plugin flags this pattern.

The fix is to push the hook down into its own component, so each rendered
instance gets its own independent call to `useReveal()` at that
component's top level:

```tsx
export function Reveal({ variant = "fade", className, children }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} data-reveal={variant} className={className}>{children}</div>;
}
```

Now the section just renders one `<Reveal>` per item — each is its own
component instance with its own hook call, which is exactly what the Rules
of Hooks expect:

```tsx
{journeySteps.map((step) => (
  <Reveal key={step.n} variant="fade">...</Reveal>
))}
```

This `Reveal` component is now reusable for every remaining section that
has repeated cards (Services, Gallery, Testimonials, FAQ) — one wrapper,
written once, instead of re-solving this per section.

## Layout notes

The header row uses `flex-[2_1_420px]` / `flex-[1_1_320px]` (Tailwind's
arbitrary-value syntax for the `flex` shorthand) to reproduce the design's
2:1 ratio between the heading column and the supporting paragraph, while
still letting both wrap to full width on narrow screens — the same
`grow shrink basis` pattern used throughout this design instead of fixed
percentage widths.
