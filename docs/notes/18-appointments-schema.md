# 18 — The appointments data model

**Commit:** `feat: define services, clinic_hours, and appointments schema`
**Files:** `src/db/schema.ts`, `src/db/seed.ts`, `package.json`

## What this was

The actual data model for Phase 1 of the real product: three tables that
together let the app know what services exist, when the clinic is open,
and what's been booked.

## The three tables, and why they're shaped this way

**`services`** — same shape as the `Service` interface already in
`src/data/site.ts` (`code`, `title`, `desc`), just moved into the
database. This isn't a new design, it's the existing static data getting
a real home so the admin dashboard can edit it later without a code
deploy. `isActive` exists so a service can be retired from the booking
form without deleting its history (an appointment referencing a retired
service should still show what it was for).

**`clinic_hours`** — one row *per weekday*, always seven rows, rather
than "no row = closed." A day that's closed is `isClosed: true` with null
open/close times, not a missing row. This matters for correctness: if
Sunday just had no row, a bug that accidentally queried the wrong day
range would silently treat "no data" the same as "closed," which is the
same failure mode either way — but an explicit `isClosed` column makes
"is the clinic open Tuesday" a single readable boolean check instead of
"does a row exist for day 2." `dayOfWeek` uses `0=Sunday..6=Saturday` to
match JavaScript's own `Date#getDay()`, so no translation table is needed
when checking "is this requested date's weekday open" later in the
availability logic (next commit).

**`appointments`** — the actual bookings. Two choices worth explaining:

- **No `patients` table.** `patientName`/`patientPhone` are stored
  directly on the appointment row instead of as a foreign key to a
  separate patients table. A normalized patients table is the "obviously
  more correct" design, but it's solving a problem this project doesn't
  have yet — there's no patient login, no patient history view, nothing
  that needs to join appointments back to a patient record. Adding that
  table now would be speculative complexity: real effort spent on a
  feature (patient history) that was explicitly deferred to a later
  phase. If/when that phase happens, migrating from
  "phone number on the row" to "a patients table with a foreign key" is a
  straightforward migration, not a rewrite.
- **`status` is a Postgres enum** (`pending` / `confirmed` / `cancelled`),
  not a free-text column. This makes an invalid status a database-level
  constraint violation instead of a bug that only shows up when the UI
  tries to render an unexpected string.

## The seed script

`src/db/seed.ts` ports the *existing* static `services` and `hours` data
from `src/data/site.ts` into the real tables, so the database starts with
real, already-correct content instead of empty tables the admin has to
re-enter by hand. It uses `onConflictDoNothing` keyed on the natural
unique columns (`code` for services, `dayOfWeek` for hours) specifically
so it's safe to run more than once — re-running it after tables already
have data just no-ops instead of erroring or duplicating rows.

The trickiest part is `parseHourRange`/`to24Hour`: the static data stores
hours as human strings like `"9:00 AM – 7:00 PM"`, but Postgres's `time`
type wants `"09:00:00"`. This conversion only needs to run once, at seed
time — the runtime availability-checking code (next commit) works
entirely in the DB's 24-hour format, never re-parsing the display string.

## What's still missing

No migration has been generated or run yet — that needs `DATABASE_URL`
pointed at the real Neon project, which isn't wired into `.env.local` in
this environment. `npm run db:push` (schema → DB) and `npm run db:seed`
(populate it) are the next two commands to run once that's set up, before
the booking form can actually write anywhere.
