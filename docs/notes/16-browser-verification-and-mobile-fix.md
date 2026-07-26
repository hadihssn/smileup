# 16 — Browser verification pass and a mobile overflow fix

**Commit:** `fix: prevent navbar overflow on narrow mobile widths`
**Files:** `src/components/layout/Navbar.tsx`

## What this was

A full pass through every section — desktop, tablet, and mobile widths,
plus the actual interactions (mobile menu, booking form submit, FAQ
accordion) — clicking through the running app rather than just trusting
that the code compiled. Compiling and type-checking prove the code is
*valid*; they don't prove it *looks right* or *works* at every screen
size. This step is what catches the gap between the two.

## The bug this caught

At 375px-wide viewports (a typical phone), the navbar's logo + "Book
Appointment" button + hamburger icon didn't fit their available width —
the hamburger button got pushed partially off-screen instead of wrapping.
Checked directly in the DOM:

```js
document.querySelector('nav > div').scrollWidth  // 389
document.querySelector('nav > div').clientWidth  // 375 — 14px of overflow
```

The fix shrinks the "Book Appointment" button's padding/font-size and the
row's gaps specifically below the `nav:` breakpoint (1080px), while
leaving the desktop sizing untouched:

```tsx
className="... px-3.5 py-2.5 text-[13px] ... nav:px-5 nav:py-[11px] nav:text-sm"
```

This is the same pattern as [04](04-navbar.md)'s breakpoint-driven
hide/show, just applied to sizing instead of visibility: default classes
target the narrowest case, and `nav:`-prefixed classes override them once
there's enough room.

## Why this needed a real browser, not just reading the code

Every individual value here (padding, gap, font-size) looks reasonable in
isolation — nothing about `px-5 py-[11px]` on a button screams "this will
overflow." The bug only exists as an *interaction* between the logo's
width, the button's width, the hamburger's width, and the three gaps
between them, at one specific viewport width. That's the general argument
for the project's `AGENTS.md`/CLAUDE.md instruction and this codebase's own
practice throughout the build: type-checking and linting verify the code
is correct; only actually loading the page catches whether the *design*
holds up.

## What else this pass confirmed

- No console errors/warnings anywhere in the app.
- No horizontal overflow at 320px, 375px, 768px, 1079px, or desktop widths.
- The booking form's controlled inputs and submit-success state
  ([12](12-booking-form.md)) work end-to-end.
- The FAQ accordion's per-item independent state ([13](13-faq-accordion.md))
  toggles correctly — multiple items can be open at once, exactly as
  designed.
- The count-up animation ([05](05-hero-section.md)) only fails to *finish*
  in this specific automated-browser harness, because that harness reports
  `document.hidden = true` and browsers pause `requestAnimationFrame` on
  hidden tabs — not a bug in the app itself.
