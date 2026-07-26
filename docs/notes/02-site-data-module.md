# 02 — Site content as data

**Commit:** `feat: add site content data module`
**Files:** `src/data/site.ts`

## What this does

Every section that repeats a card (services, gallery, testimonials, FAQ,
opening hours) gets its content from a plain array in `src/data/site.ts`,
instead of the content being hardcoded into JSX. Components then `.map()`
over the array to render each card.

```ts
export interface Service {
  code: string;
  title: string;
  desc: string;
}

export const services: Service[] = [
  { code: "TW", title: "Teeth Whitening", desc: "..." },
  // ...
];
```

```tsx
{services.map((s) => (
  <ServiceCard key={s.code} {...s} />
))}
```

## Why separate data from markup

1. **One card, many entries.** The JSX for a service card is identical for
   all eight services — only the words change. Writing it eight times would
   mean eight places to fix a bug. Writing it once and mapping over data
   means one place.
2. **Content changes don't touch layout code.** Swapping in the real clinic
   address or a new testimonial is an edit to a data file, not to a
   component's JSX/CSS. That separation matters even more once this becomes
   a real backend (task list item: an admin panel where the dentist edits
   this content directly) — the *shape* of the data (the TypeScript
   `interface`) stays the same whether it comes from a static file or a
   database query.
3. **TypeScript catches mistakes early.** Because `services` is typed as
   `Service[]`, if a component expects `s.title` and the data has a typo
   like `titel`, TypeScript flags it at build time instead of silently
   rendering `undefined` in the browser.

## Where this is heading

Right now `contact` (phone/address/hours) and `services`/`testimonials`/etc.
are hardcoded arrays. When the appointment system and admin dashboard get
built later, these are exactly the shapes that would move into a database —
the interfaces defined here (`Service`, `Testimonial`, `FaqItem`, ...)
become the schema.
