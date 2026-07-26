# 13 — FAQ accordion

**Commit:** `feat: build FAQ accordion`
**Files:** `src/components/sections/Faq.tsx`

## What this does

Six FAQ items where clicking a question expands/collapses its answer,
independently per item — more than one can be open at once, unlike a
typical "only one open at a time" accordion.

## Key concept: modeling "which items are open" with a `Set`

Rather than one boolean per item, or an array the same length as the FAQ
list, open/closed state is a single `Set<number>` of open indexes:

```ts
const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

function toggle(index: number) {
  setOpenIndexes((prev) => {
    const next = new Set(prev);
    next.has(index) ? next.delete(index) : next.add(index);
    return next;
  });
}
```

A `Set` is a natural fit for "membership in a group that changes over
time" — checking `openIndexes.has(index)` to decide whether an item is
expanded reads clearly, and adding/removing is O(1). The alternative,
`{ [index]: boolean }` (what the original design prototype used), works
too, but a `Set` avoids ever having `false` entries lying around for items
that were opened and closed again — it only ever contains what's actually
open.

**Note the `new Set(prev)` copy.** React only re-renders when state
*looks* different by reference (`Object.is` comparison) — mutating
`prev` directly (`prev.add(index); return prev;`) would return the same
Set reference, and React would skip the re-render entirely. Copying into
a new `Set` first, then mutating the copy, is what makes the update
visible — the same rule as spreading an object or array in `setState`.

## Everything else is familiar

Data-driven (`faq` array from [02](02-site-data-module.md)), wrapped per
item in `Reveal` ([06](06-reveal-component-and-approach-section.md)), and
the `+`/`−` symbol is just a ternary on `isOpen` — no new patterns beyond
what earlier sections already established.
