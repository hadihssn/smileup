# 29 — A real dashboard, not a marketing page with tabs

**Commit:** `feat: redesign admin dashboard with sidebar shell and neutral UI`
**Files:** `src/app/admin/layout.tsx`, `src/app/admin/_components/AdminSidebar.tsx`,
`src/app/admin/_components/PageHeader.tsx`, every `/admin/*` page,
`src/app/admin/_components/statusStyles.ts`, `src/app/auth/sign-in/page.tsx`

## What this was

The user's feedback was blunt and correct: the admin section looked like
"a semester project," not a tool a dentist would trust with his real
schedule and money. Everything up to this point had been built by
reusing the marketing site's design language directly — its bright
brand green, its playful heading font, its rounded-card-with-shadow
pattern for every single row. That's right for a landing page trying to
look inviting. It's wrong for a clinical tool someone uses daily, where
the job is scanning information quickly, not being charmed by it.

## The diagnosis, concretely

- **No consistent type scale.** Values like `text-[13.5px]`,
  `text-[14.5px]`, `text-[12px]` were scattered across every page —
  each one a one-off decision, not a system. A real interface has maybe
  4–5 text sizes used consistently everywhere.
- **The brand color was everywhere.** Active tabs, badges, buttons, even
  hover states all reached for the same saturated green. When an accent
  color is used for everything, it stops meaning anything — restraint is
  what makes an accent read as intentional.
- **Every row was a floating card.** `rounded-2xl` + a soft drop shadow
  on *every single appointment/patient row* is fine for three items on a
  landing page; for a list of twenty patients it's visual noise — each
  row competing for attention instead of sitting quietly in a scannable
  list.
- **Top tabs, not a persistent nav.** Tabs at the top of a page read as
  "sections of a webpage." A left sidebar that stays put while content
  changes reads as "an application" — the distinction most real tools
  (Stripe, Linear, Notion) make deliberately.
- **Zero icons anywhere.** Confirm/Cancel/Edit were bare text buttons.
  Nothing wrong with text buttons per se, but a dashboard with no
  iconography anywhere reads as unfinished/prototype-stage, not shipped.

## The direction, confirmed with the user before rebuilding

Given how large and subjective a "full redesign" request is, two
structural questions were worth confirming before touching code rather
than guessing and redoing work: replace top tabs with a persistent
sidebar (yes), and add an icon library (yes, `lucide-react`). Everything
else — the neutral palette, the type scale, table-like lists — followed
from those two decisions plus ordinary design judgment, without needing
to check in on each individual choice.

## `layout.tsx`: one shell, one auth check, not six

Every `/admin/*` page used to independently call `auth.getSession()` and
render its own copy of the header/nav (first as inline markup, then as
the shared `AdminHeader` from [27](27-patient-insights.md)). Next.js's
App Router has a purpose-built mechanism for exactly this:
`src/app/admin/layout.tsx` wraps every nested route automatically. Moving
the session check and the sidebar shell there means it exists exactly
once — not duplicated six times across six pages, one per route. This
also deleted `AdminHeader.tsx` entirely; the individual pages no longer
need to know about the session or render navigation at all, they just
return their own content.

The layout's own `auth.getSession()` check is still there *in addition*
to `src/proxy.ts`'s route-level protection — the same defense-in-depth
reasoning as [21](21-admin-login.md)'s proxy.ts bug and
[23](23-admin-actions-and-blocked-dates.md)'s `requireSession()` calls:
one protection layer having worked correctly so far isn't a reason to
rely on only one.

## Why the sidebar is a Client Component but the layout isn't

`AdminSidebar.tsx` starts with `"use client"` — it needs `usePathname()`
to know which nav item to highlight as active, and that hook only exists
client-side. `layout.tsx` itself stays a Server Component (it needs
`auth.getSession()`, which only runs server-side) and simply renders the
client sidebar as a child. This is the normal shape of a Next.js App
Router page: server-rendered data-fetching wrapping small, targeted
client islands only where interactivity is actually needed — not "make
everything client" or "make everything server," but the smallest client
boundary that does the job.

## Tailwind's built-in slate scale, not new custom tokens

The marketing site's `@theme` tokens (`--color-ink`, `--color-muted`,
`--color-line`) are neutral-*ish*, but tuned with a slight green cast to
suit a warm, brand-forward landing page. Rather than adding a parallel
set of admin-specific custom tokens, the redesign just uses Tailwind
v4's already-available `slate-*` scale directly (`slate-50` background,
`slate-200` borders, `slate-900`/`slate-500` text) — a genuinely neutral
gray, distinct from the marketing site's green-tinted neutrals, with
zero new tokens to maintain. `brand`/`brand-dark`/`brand-tint` (already
defined) are kept as the *only* accent color, and now used narrowly:
primary buttons, the active sidebar item, and positive-trend text — not
spread across every badge and hover state like before.

## Rows as a divided list, not stacked cards

Every list (appointments grouped by date, patients, visit history,
revenue's completed-visits breakdown) changed from
`flex flex-col gap-2` + individually-shadowed rounded cards to one
`rounded-xl border border-slate-200` panel with `divide-y` between rows.
This is the difference between "twenty separate floating objects" and
"one scannable list" — the visual weight moves from each row shouting
for attention to the *content* being what's easy to read.

## `PageHeader`: one header shape, everywhere

A small shared component (title + optional subtitle + optional primary
action) used identically across every page. Previously each page had
its own ad hoc `<h1>`/spacing combination; now changing how a page title
looks happens in one place.

## Verified against the real, already-populated database

Every page was checked visually and functionally against the demo data
already in the database (not fresh test data) — the point was confirming
the redesign works with real content at real volume (20 patients, a
multi-month revenue history), not an empty state. Explicitly verified:
the Confirm action still works correctly through the new icon-button
markup (clicked, watched a pending appointment become confirmed, then
reverted it back to its original state afterward); the patient detail
page, revenue breakdown, and new/edit appointment forms all render
correctly with real data; the layout holds up reasonably at tablet width
(this is a desk-based clinic tool, not something built mobile-first, but
it shouldn't visibly break either).
