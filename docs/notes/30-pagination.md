# 30 — Pagination across every admin list

**Commit:** `feat: add pagination to appointments, revenue, and patients`
**Files:** `src/lib/pagination.ts`, `src/app/admin/_components/Pagination.tsx`,
`src/lib/appointments.ts`, `src/lib/revenue.ts`,
`src/app/admin/page.tsx`, `src/app/admin/revenue/page.tsx`,
`src/app/admin/patients/page.tsx`, `src/app/admin/patients/[phone]/page.tsx`

## What this was

The user's own instinct was right: every list in the admin section
(appointments, patients, a patient's visit history, revenue's
completed-visits breakdown) rendered its *entire* result set, unbounded.
Fine at demo scale (20 patients), not fine as a real clinic accumulates
years of appointments. This adds `?page=` pagination everywhere, 10 rows
per page (`PAGE_SIZE` in `src/lib/pagination.ts`).

## Two genuinely different kinds of pagination, not one

This is the important distinction, worth being precise about rather than
applying one mechanism everywhere and calling it done:

**Appointments and Revenue's breakdown list are true DB-level
pagination.** Both are plain filtered/sorted row lists with no cross-row
aggregation — `getAppointments()` and the revenue breakdown query now
use real `LIMIT`/`OFFSET`, with a separate `count(*)` query for the page
count. The database only ever does the work for one page's worth of
rows. This is a genuine reduction in query cost, not just in what's
rendered.

**Patients and a patient's visit-history are pagination *after* the
data is already loaded.** This can't be done at the query level without
breaking correctness: a patient's summary (last visit, lifetime revenue,
overdue status) is computed by walking their *entire* appointment
history (`patients.ts`, unchanged since [27](27-patient-insights.md)) —
there's no way to know a patient's last visit or total revenue by only
looking at 10 of their appointments. So `getPatientsOverview()` and
`getPatientDetail()` still fetch everything they need to aggregate
correctly; only the *page component* slices the resulting array before
rendering it. This still delivers most of what pagination is for — a
bounded DOM size, a lighter page, less for the browser to render — just
not a smaller database scan. Being upfront about that distinction
matters more than it might seem: silently claiming "pagination" as a
uniform performance fix when half of it doesn't reduce query cost would
be a misleading account of what actually changed.

## Revenue's totals stay unpaginated, on purpose

The most important thing to get right here: `getRevenueSummary()`'s
month total, patient count, and missing-charge count are all separate
aggregate queries (`sum()`, `count()`) that already existed independently
of the breakdown list — pagination only touches the *rows* query that
feeds the visible list. The total must reflect the whole month
regardless of which page of the breakdown the dentist is looking at; if
pagination had accidentally been threaded through the aggregate queries
too, "revenue this month" would silently and incorrectly only reflect
whichever page happened to be loaded. Verified directly: paginating the
breakdown list does not change the total/comparison numbers shown above
it.

## One shared `Pagination` component, `buildHref`-driven

`src/app/admin/_components/Pagination.tsx` renders Prev/Next plus a
"Page X of Y" label, and takes a `buildHref(page)` callback rather than
assuming a URL shape — each page knows its own other query params
(`view`, `month`, or `filter`/`q`/`service` for patients) and is
responsible for carrying them forward. This is the same pattern already
established for the patients filter toggle
([28](28-patient-search-and-service-filter.md)): the current state is a
real URL, not client state, so a paginated page is still bookmarkable
and survives a refresh.

## `parsePage`/`totalPagesFor` clamp everything

A raw `?page=` value from the URL is untrusted input — `parsePage`
rejects anything non-numeric or ≤ 0, defaulting to 1. Every page also
clamps its *effective* page to `[1, totalPages]` (`Math.min(page,
totalPages)`), so a stale bookmark or a manually-edited URL pointing past
the last page (e.g. `?page=99` after some rows were deleted) renders the
last real page instead of an empty page or an out-of-range `OFFSET` that
returns nothing.

## Verified against the real, populated database

Confirmed all of the above through the actual running app rather than
just reading the code: the patients list (20 patients) correctly shows
"Page 1 of 2" with exactly 10 rows, and page 2 shows the remaining 10;
the appointments "All" view paginated to "Page 1 of 3" for its ~25 rows;
the revenue page's total/comparison numbers were unchanged after adding
pagination to its breakdown list (still Rs 41,000 / 34.7% down, matching
the pre-pagination numbers from [29](29-admin-dashboard-redesign.md));
and a low-volume patient detail page (2 visits) correctly rendered with
no pagination control at all, rather than an empty or broken one.
