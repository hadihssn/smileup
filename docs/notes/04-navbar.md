# 04 — Sticky navbar with mobile menu

**Commit:** `feat: build sticky navigation with mobile menu`
**Files:** `src/components/layout/Navbar.tsx`, `src/app/page.tsx`, `src/app/globals.css` (custom breakpoint)

## What this does

A sticky nav bar: logo, in-page links, phone number, a "Book Appointment"
pill button, and — below a 1080px viewport width — a hamburger button that
reveals the same links in a dropdown.

## Key concepts

**Sticky positioning.** `sticky top-0 z-50` keeps the nav pinned to the top
of the viewport as you scroll, without removing it from the page flow the
way `position: fixed` would. `backdrop-blur-md` on a semi-transparent white
background (`bg-white/90`) gives the frosted-glass effect as content
scrolls underneath it.

**A custom Tailwind breakpoint.** The design collapses to a hamburger at
exactly 1080px, which doesn't land on any of Tailwind's default breakpoints
(`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Tailwind v4 lets you declare your
own directly in `@theme`:

```css
--breakpoint-nav: 1080px;
```

That immediately makes a `nav:` variant available, so `hidden nav:flex`
means "hidden by default, shown as flex from 1080px up."

**Why CSS media queries instead of a JS resize listener.** The original
design prototype used a `window.innerWidth` check plus a `resize` event
listener to decide whether to show the link row or the hamburger. In a real
codebase that's usually the wrong tool: it re-renders React on every resize
event, and the layout still has to reconcile with CSS underneath it anyway.
A `nav:` breakpoint lets the *browser's own layout engine* decide, with zero
JavaScript and zero re-renders — CSS is the right tool for "what does this
look like at this viewport width," and JS is reserved for actual
interactivity (the hamburger's open/closed state).

**Client Component boundary.** The hamburger's open/closed state
(`useState`) is the only interactive part of this component, which is why
the whole file is marked `"use client"` — see
[03](03-scroll-reveal-and-count-up-hooks.md) for what that directive means
and why it's necessary here.

**Closing the menu on link click.** Each mobile link's `onClick` calls
`setMobileMenuOpen(false)`, so tapping a link both navigates (via the
browser's native anchor-scroll behavior) and closes the dropdown, rather
than leaving it open over the section you just jumped to.
