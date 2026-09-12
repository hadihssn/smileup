# 27 — Patients: derived customer insight, no new table

**Commit:** `feat: add patient insights with recall tracking`
**Files:** `src/lib/patients.ts`, `src/lib/dateRange.ts`,
`src/app/admin/patients/`, `src/app/admin/_components/AdminHeader.tsx`,
`src/app/admin/_components/statusStyles.ts`

## What this was

The user's observation: the dashboard tells the dentist what happened
(appointments, revenue) but nothing about *who his patients are* — when
someone last came in, what they were treated for, whether they're
overdue for a checkup. This adds a "Patients" tab answering exactly that,
without adding a new database table.

## No `patients` table — patients are derived from appointments

This is the one real design decision here, and it's worth being explicit
about why. `docs/notes/24` already flagged this exact fork when
`appointments` was designed: patient identity lives on the phone number,
not a foreign key to a separate table, specifically *because* nothing yet
needed data that lives on a patient rather than on a visit. That's still
true here — "last visit," "lifetime revenue," "overdue for recall" are
all facts you can compute by grouping existing appointment rows on
`patientPhone`. A `patients` table only earns its cost once something
needs to live on the patient that a visit can't hold — medical history,
allergies, a patient's own login. Building that table now, for a feature
that doesn't need it, would be exactly the "speculative complexity"
`docs/notes/24` already decided against once.

Phone is the identity key (not name) because it's the more stable
real-world identifier — two real patients essentially never share a
phone number, whereas name spelling/formatting can vary visit to visit.

## The aggregation happens in application code, not SQL

`buildPatientSummaries()` and `buildMonthStats()` both take a plain array
of appointment rows and reduce them in TypeScript, rather than
expressing "last visit per patient" as a SQL window function or a
`GROUP BY` with `MAX()`. Two reasons:

- **`MAX(patient_name)` doesn't mean "the most recent name"** — SQL's
  `MAX` on a text column is alphabetical, not chronological. Getting "the
  patient's name as of their latest appointment" correctly in pure SQL
  needs something like `DISTINCT ON` or a window function — solvable, but
  meaningfully more complex than fetching all appointments (ordered
  ascending) once and just letting each patient's fields get overwritten
  as the loop walks forward in time. The last write for any given phone
  number is, by construction, the most recent one.
- **Scale.** A single dental clinic's appointment history is not a
  dataset where in-application aggregation is a performance risk. Fetch
  once, reduce in memory — simpler to read, simpler to get right, and
  fast enough that "correct and simple" wins over "clever SQL" here.

## The recall window and why "overdue" excludes patients with something booked

`RECALL_WINDOW_DAYS = 182` (~6 months) matches the checkup cadence
already stated in the site's own FAQ content
(`src/data/site.ts`'s FAQ: "we recommend a checkup ... every six
months"). A patient only counts as overdue if their **last completed
visit** was 6+ months ago **and they have nothing upcoming** — a patient
who hasn't been in for 8 months but already has a confirmed appointment
next week isn't someone who needs a recall call, they're already coming
in. Verified directly: a test patient with an old last visit but a
booked future appointment correctly did *not* appear in the overdue
list, while one with an equally old last visit and nothing booked did.

## "New" vs "returning" this month — computed against all-time history

A patient is "new this month" if their first-ever completed visit falls
in the month being viewed; "returning" if they completed a visit this
month but had already completed at least one before it. This needs the
*entire* history, not just this month's rows — `buildMonthStats()` builds
a `firstCompletedVisit` map across every row before checking which
patients are new vs returning, rather than trying to infer it from a
month-filtered query alone (which would have no way to know whether a
patient's "first" visit in the query window was actually their first
visit ever).

## Reuse and a small refactor along the way

Three pages now share the same header/tab-nav (`AdminHeader.tsx`) instead
of each carrying its own copy — worth extracting now, at three pages,
rather than letting a fourth divergent copy appear later.
`STATUS_STYLES` (previously private to the appointments list) moved to
`_components/statusStyles.ts` since the patient detail page's visit
history needs the same status badge colors. `monthBounds()` (previously
private to `revenue.ts`) moved to a new `lib/dateRange.ts`, since
`patients.ts` needed the exact same month-boundary math for "new/
returning this month" — rather than have one lib reach into another's
internals, both now import it from a shared, purpose-named module.

## Verified against the real database and UI

Seeded four realistic test patients covering every branch of the logic:
one overdue (old visit, nothing booked), one new-this-month (first-ever
visit inside the current month), one returning-this-month (an older
visit plus one this month), and one with an old last visit *but* an
upcoming booking (to confirm the "has something booked" exclusion
actually works, not just the date-cutoff check). All four counts and
classifications came back correct through the real signed-in UI — total
patients, new/returning this month, and the overdue filter showing
exactly the one patient who should be on it. Confirmed the detail page's
visit history, summary stats, and Edit links against a real two-visit
patient. All test data removed afterward, leaving only the user's own
pre-existing test bookings untouched.
