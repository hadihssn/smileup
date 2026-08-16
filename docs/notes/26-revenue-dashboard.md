# 26 — The revenue dashboard

**Commit:** `feat: build revenue dashboard with month-over-month comparison`
**Files:** `src/lib/revenue.ts`, `src/app/admin/revenue/page.tsx`

## What this was

The actual point of this whole detour from booking/scheduling into
money: a page where the dentist can see this month's revenue, how it
compares to last month, and the granular per-appointment breakdown
behind that number. This is the feature the user described as
potentially *more valuable* than the booking system itself — visibility
into his numbers is something he likely doesn't have today.

## Month boundaries as a half-open range, not a string match

```ts
function monthBounds(yearMonth: string): { start: string; end: string } {
  // "2026-08" -> { start: "2026-08-01", end: "2026-09-01" }
}
```

The tempting shortcut is filtering `appointmentDate LIKE '2026-08-%'`.
Two reasons this function does it differently: a half-open range
(`>= start AND < end`) can use a normal index on `appointmentDate`
efficiently, where a `LIKE` pattern generally can't; and computing `end`
correctly handles December rolling into January of the *next* year
(`shiftMonth`/`monthBounds` both do plain month-arithmetic on year/month
numbers, not string manipulation, so this isn't a special case that
needed separate handling — it falls out of the same arithmetic every
other month uses).

## Revenue only counts `completed` visits with a charge actually entered

This is worth restating from [24](24-revenue-tracking-schema.md) because
the query encodes it in a way that's easy to get subtly wrong:

```sql
where status = 'completed'
  and appointment_date >= start and appointment_date < end
  and charge_amount is not null
```

A `completed` appointment with no charge entered (staff forgot) is
**excluded from the sum**, not treated as if it charged Rs 0. Silently
counting it as zero would make the total *look* accurate while actually
being wrong in a way nobody would notice — the number would just be a
little low every month, for no visible reason. Instead, those get
counted separately (`missingChargeCount`) and surfaced as a visible
warning banner with a direct link to fix them, so the gap is obvious
rather than silently baked into a number nobody double-checks.

## Month-over-month comparison, and the zero-previous-month edge case

```ts
const changePercent =
  previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : null;
```

If last month had zero revenue, a percent-change calculation would
either divide by zero or produce a meaningless "∞% up." Returning `null`
instead, and having the UI show "No revenue last month to compare"
rather than a broken or nonsensical percentage, is the correct handling
of a real edge case — not a defensive `try/catch`, just recognizing that
"percent change from zero" isn't a well-defined question and shouldn't
be forced into an answer.

## The granular breakdown is the same `AppointmentRow` shape

The per-appointment list on this page reuses the exact `AppointmentRow`
interface from [22](22-admin-dashboard-list-view.md)/[24](24-revenue-tracking-schema.md)
and the same `formatDateLabel`/`formatTimeLabel`/`formatPKR` formatters
used everywhere else in admin. This wasn't a separate "reporting" data
shape built from scratch — it's the same appointment data, just queried
with a different filter (this month, completed only) and a different
sort (chronological within the month, for reading top-to-bottom like a
statement) than the main dashboard's views.

## The expense-tracking note is a UI callout, not a feature

Per the user's explicit answer on scope: this tracks revenue (money
collected) only, deliberately not expenses/profit — building both would
turn this into different, larger software. But the user wanted a way to
raise the *idea* of expense tracking with the dentist in their meeting,
without actually building it prematurely. The dashed-border callout box
on the page is exactly that: a visible note, not a working feature —
something to point at in conversation ("we could build this next if it'd
help") rather than a half-built expense system nobody asked for yet.

## Verified against the real database and UI

Populated real completed appointments across two different months
(August: one visit, Rs 4,500; September: one visit, Rs 8,000) and
confirmed through the actual running app: each month's total and count
were correct in isolation, the September page correctly showed "▲ 77.8%
up" compared to August's real total (not a hardcoded or estimated
figure), Prev/Next navigation moved between real months via the URL
(`?month=2026-08` / `?month=2026-09`), and marking a third appointment
`completed` with no charge correctly triggered the missing-charge
warning while leaving the month's total unaffected. All test data
reverted afterward — see [25](25-manual-entry-and-editing.md) for the
cleanup details covering the same session.

## Where Phase 1 stands now

This closes out the "manage his numbers" extension the user asked for on
top of the original Phase 1 scope (real booking + admin dashboard). The
full feature set as of this commit: real booking with double-booking
protection, admin login, a filterable appointments dashboard, confirm/
cancel actions, blocked dates that actually affect availability, full
manual entry and editing (including charges), and a revenue view with
month-over-month comparison. Everything has been verified against the
live database and the real signed-in UI, not just reasoned about from
reading the code.
