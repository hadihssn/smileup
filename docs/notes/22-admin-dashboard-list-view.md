# 22 — The real admin dashboard: appointments list

**Commit:** `feat: build admin dashboard appointments list`
**Files:** `src/lib/appointments.ts`, `src/lib/format.ts`,
`src/app/admin/page.tsx`, `src/components/sections/Booking.tsx`

## What this was

Replaced the placeholder "signed in as..." admin page from
[21](21-admin-login.md) with the actual dashboard: appointments grouped
by date, filterable between Today / Upcoming / All, each row showing
time, patient, phone, service, and status.

## The filter is server-driven, not client-side

`/admin?view=today|upcoming|all` — the filter is a URL search param read
in the Server Component itself (`(await searchParams).view`), not client
state filtering an already-loaded list. Two reasons this matters more
than it might look:

- **The dentist could have hundreds of appointments over time.** Loading
  "all" appointments into the browser just to filter them client-side
  would mean the "Today" view still downloads every historical
  appointment ever made. Filtering in the database query
  (`src/lib/appointments.ts`) means "Today" only ever fetches today's
  rows.
- **It's shareable/bookmarkable.** `/admin?view=today` is a real URL —
  refreshing the page, sharing it, or opening it fresh all land on the
  same filtered view, because the filter *is* the URL, not transient
  React state that resets on reload.

This is exactly the "use the `searchParams` prop when you need search
parameters to load data for the page" guidance from Next's own docs —
worth calling out because it's the opposite instinct from how the
booking form's client-side state works ([20](20-real-booking-and-availability.md)):
that's ephemeral form input, this is a bookmarkable view into server
data. Same framework, deliberately different pattern for a different job.

## Two sort orders, not one

`getAppointments()` sorts "today"/"upcoming" soonest-first, but "all"
sorts most-recent-first. This isn't an oversight, it's the two views
having genuinely different purposes: Today/Upcoming answer "what's
happening next," where the most urgent thing belongs at the top. All is
a history view — the useful thing to see first there is what most
recently happened, not the oldest appointment in the database.

## Sharing formatters instead of duplicating them

`src/lib/format.ts` is new: `formatTimeLabel` (`"14:30"` → `"2:30 PM"`)
and `formatDateLabel` (`"2026-08-20"` → `"Thu, Aug 20"`). The time
formatter already existed as a private function inside `Booking.tsx`
([20](20-real-booking-and-availability.md)) — it's been pulled out and
both the booking form and the admin dashboard now import the same
function. Two independent implementations of "format a time slot for
display" would inevitably drift (a fix or tweak in one place not applied
to the other) — pulling it into `lib/` the moment a second consumer
needed it is the smallest version of "don't repeat yourself" that
actually matters here, not a speculative abstraction for code that might
someday need it.

`formatDateLabel` reuses the same local-date-parsing trick as
`availability.ts`'s `dayOfWeekFor` (building the `Date` from split
year/month/day numbers instead of `new Date(dateStr)` directly) for the
identical reason: avoiding a UTC-parse-then-local-convert day shift.

## Status is a color+label pair, defined once

```ts
const STATUS_STYLES: Record<AppointmentRow["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-tint text-brand-dark",
  cancelled: "bg-line text-muted line-through",
};
```

Typed as `Record<AppointmentRow["status"], string>` rather than a
`switch` or a plain object — this means adding a new status to the
database enum without adding it here is a **type error**, not a silently
un-styled badge. The type system enforces that the UI can't drift out of
sync with the schema's `appointmentStatus` enum from
[18](18-appointments-schema.md).

## Verified against the real database

Inserted three test appointments (today ×2 with different statuses,
tomorrow ×1) directly into Postgres, loaded `/admin` through the actual
signed-in browser session, confirmed: correct date grouping, correct
status badge colors, "Today" filter correctly narrows to just today's
two rows. Also incidentally confirmed the booking form from
[20](20-real-booking-and-availability.md) is being used for real — two
real appointments (not test data) already existed in the table from
earlier manual testing of the live form. Cleaned up the test rows
afterward, left the real ones alone.
