# 14 — Footer and floating WhatsApp button

**Commit:** `feat: build Footer and floating WhatsApp button`
**Files:** `src/components/layout/Footer.tsx`, `src/components/layout/WhatsAppButton.tsx`, `src/app/page.tsx`

## What this does

The dark-green footer (brand blurb, nav links, contact links, social
icons, copyright bar) and the circular WhatsApp button fixed to the
bottom-right corner on every screen.

## Key concepts

**Deriving one list from another instead of duplicating it.** The
footer's "Navigate" column only shows 4 of the navbar's 7 links (no
Dentist/Contact/FAQ). Rather than hardcoding a second link array that
could drift out of sync with `navLinks`, it filters the existing one:

```ts
const footerNavLinks = navLinks.filter((link) =>
  ["#why", "#services", "#gallery", "#testimonials"].includes(link.href),
);
```

If a nav link's label or href ever changes in `site.ts`, the footer picks
up the change automatically — there's only one source of truth for what
"Services" links to, even though it appears in two places on the page.

**Fixed positioning, outside `<main>`.** The WhatsApp button is rendered
as a sibling of `<main>` in `page.tsx`, not inside any section:

```tsx
<main>...</main>
<Footer />
<WhatsAppButton />
```

`position: fixed` takes an element out of normal document flow and pins it
to the viewport regardless of scroll — so where it sits in the component
tree doesn't affect where it renders on screen. Placing it at the page's
top level (rather than nested inside, say, the last section) makes that
independence obvious just from reading the file structure.

**`z-[60]` vs the navbar's `z-50`.** The navbar is sticky at `z-50`
([04](04-navbar.md)); the WhatsApp button sits above it at `z-[60]` so it's
never hidden behind the nav bar even though both are fixed/sticky
elements competing for the same corner of the screen. Higher `z-index` =
"stacks on top" — worth deliberately ordering when a page has more than
one element removed from normal flow.
