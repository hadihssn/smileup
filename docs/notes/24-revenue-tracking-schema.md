# 24 — Schema for revenue tracking: completed status, charge amount

**Commit:** `feat: add completed status and charge amount to appointments`
**Files:** `src/db/schema.ts`, `src/lib/appointments.ts`

## What this was

The first step of a new direction the user raised: the booking/admin
system is useful, but the *more valuable* thing for the dentist is
visibility into his numbers — what a given appointment was charged, and
what that adds up to per month. This commit is just the schema and data
layer; the actual UI (manual entry, editing, the revenue view) is the
next two commits.

## Two new fields, and the reasoning behind each

**`chargeAmount` (nullable integer, whole PKR)** — deliberately *not* a
lookup from a service price list. Real clinics negotiate, discount, and
adjust for insurance or case complexity per visit; a fixed catalog price
per service would make the recorded revenue number wrong the moment
reality diverges from the price list (which is often, per the user's own
answer to this question). So the amount is entered manually per
appointment — closer to what the dentist is probably already doing
somewhere (a notebook, a spreadsheet), just centralized where the rest of
the appointment data already lives. Stored as a plain integer (whole
rupees, no paisa) rather than a decimal type — dental pricing in this
context doesn't need sub-rupee precision, and integers sidestep any
floating-point rounding surprises entirely.

**`isManualEntry` (boolean, default false)** — appointments the dentist
or staff type directly into the admin dashboard (a walk-in, a phone
booking) versus ones a patient submitted through the public form. This
matters because, per the user, online bookings are expected to be a
small fraction of real volume unless there's a specific incentive to
book online — without a way to log the rest of his actual patients, the
"monthly revenue" number would only reflect a sliver of his real income
and be actively misleading rather than useful. This flag is what lets a
future view distinguish the two without guessing (e.g. "was this ever
validated by the availability-checking logic real patients go through,
or did staff just type it in").

## `completed` — a new appointment status, and why it's not `confirmed`

Status was `pending` / `confirmed` / `cancelled`. `completed` is new,
sitting between `confirmed` and `cancelled` in meaning: it marks a visit
that **actually happened** — the patient showed up, and (per this
feature) got charged. This distinction matters specifically because of
what revenue is supposed to measure. A `confirmed` appointment is just
"on the calendar" — the patient could still no-show. If monthly revenue
summed every `confirmed` appointment's charge, the number would count
money that was never actually collected. Restricting the revenue
calculation (next commit) to `completed` appointments only means the
number reflects money actually earned, not money hoped for.

This was a deliberate scope decision, not an oversight: there's no
separate `no_show` status yet, even though a `confirmed` appointment
whose date has passed without being marked `completed` is *effectively*
an unrecorded no-show. Nothing in the app reads that distinction today,
so adding a status for it now would be speculative — a natural next
addition if the dentist specifically wants no-show tracking, not before.

## Why this is derived from the schema, not hand-typed twice

```ts
export type AppointmentStatus = (typeof appointmentStatus.enumValues)[number];
export const APPOINTMENT_STATUSES = appointmentStatus.enumValues;
```

Previously `AppointmentRow`'s `status` field was typed by hand as the
literal union `"pending" | "confirmed" | "cancelled"` — a second,
independent copy of the same information already encoded in the
database's own enum. Adding `completed` to the schema and forgetting to
update that hand-typed union would have been a real, easy-to-miss bug:
the type checker would have no way to know the two had drifted apart. Deriving the TypeScript type
directly from `appointmentStatus.enumValues` means there is exactly one
place status values are ever listed — the schema — and everything else
(the row type, a future status dropdown in the edit form) reads from it,
guaranteed to stay in sync.

## `getAppointmentById` and a shared row shape

Added alongside `getAppointments` because the upcoming edit page needs to
load one specific appointment's full data (including the new charge and
manual-entry fields) to pre-fill a form — a different access pattern
(single row by ID) than the dashboard's list view, but the same shape of
data. Both now share one `ROW_SHAPE` object instead of two independent
column-selection lists that could quietly diverge.

## Verified against the real database

Migration generated and pushed to the live Neon database; confirmed via
`enum_range(NULL::appointment_status)` that the enum now contains
`{pending, confirmed, completed, cancelled}` in that order, and that
`charge_amount`/`is_manual_entry` columns exist with the expected
nullable/default behavior.
