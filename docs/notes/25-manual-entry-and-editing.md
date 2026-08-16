# 25 — Manual appointment entry and full editing

**Commit:** `feat: add manual appointment entry and full editing`
**Files:** `src/lib/services.ts`, `src/app/admin/_components/AppointmentForm.tsx`,
`src/app/admin/appointments/new/`, `src/app/admin/appointments/[id]/edit/`,
`src/app/admin/actions.ts`, `src/app/admin/page.tsx`

## What this was

Until now, admin could only view appointments and flip pending/confirmed
↔ cancelled. This adds the two things needed for the charge amount and
`completed` status from [24](24-revenue-tracking-schema.md) to actually
be usable: a way to log a walk-in/phone appointment directly (most of the
dentist's real patients, per the user), and a way to edit *any*
appointment's full details — patient info, date/time, service, status,
and charge.

## One form component, two pages

`AppointmentForm` is a single shared component rendered by both
`/admin/appointments/new` (empty, posts to `createAppointmentAction`) and
`/admin/appointments/[id]/edit` (pre-filled via `defaultValues`, posts to
`updateAppointmentAction`, plus a hidden `id` field). Same fields, same
markup, same validation rules either way — writing this twice would mean
two places that could quietly drift apart (a field added to one form and
forgotten in the other). It's a plain function component, not a Client
Component: the form is static markup with `defaultValue` props, and both
Server Actions it posts to handle everything server-side — no client
state needed, so no reason to ship it to the browser as JS.

## Manual entries skip the availability check, on purpose

The public booking form ([20](20-real-booking-and-availability.md)) only
lets a patient pick from `getAvailableSlots()` — times that are actually
open. The admin "new appointment" form doesn't call that at all; staff
can enter any date/time directly. This is deliberate: the dentist knows
his own schedule better than the algorithm does, and a walk-in that
happened at 8:47am on a day the clinic was "closed" per `clinic_hours`
still needs to be logged for revenue purposes even though it wouldn't
have been bookable online. The database's unique index
(`appointments_active_slot_unique`, from [20](20-real-booking-and-availability.md))
is still the real safety net — it still rejects two non-cancelled
appointments at the exact same date+time, manual or not, just without
the friendly pre-check UX patients get.

## `AppointmentStatus` paying off immediately

[24](24-revenue-tracking-schema.md) derived `AppointmentStatus` and
`APPOINTMENT_STATUSES` from the schema's own enum instead of a hand-typed
list. This form is where that already pays off: the status `<select>`
maps directly over `APPOINTMENT_STATUSES` —

```tsx
{APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
```

— so the dropdown can never drift out of sync with what the database
actually accepts. Adding a status in the future (e.g. a `no_show` status,
flagged as a possible next step in [24](24-revenue-tracking-schema.md))
would make it appear in this dropdown automatically, with zero changes
needed here.

## Shared parsing, not two copies of validation

`parseAppointmentForm()` in `actions.ts` is used by both
`createAppointmentAction` and `updateAppointmentAction` — pulling fields
out of the submitted `FormData`, validating them, returning `null` on
anything invalid. Both actions redirect back to the form with an error
message on invalid input or on a slot conflict (caught from the unique
index), rather than crashing or silently doing nothing.

## Dashboard changes

- **"+ New appointment"** button next to the filter tabs.
- **"Edit"** link on every appointment row (previously only
  Confirm/Cancel existed) — now available regardless of status, since
  editing a cancelled appointment (e.g. to log why, or fix a typo) is a
  real, legitimate action.
- Rows now show the charge amount inline when set (`· Rs 8,000`) and a
  small **"(manual)"** tag for entries that didn't come through the
  public form — visibility into where the data on screen actually came
  from, not just what it says.

## Verified against the real database and UI

Full loop tested through the actual signed-in browser: edited an
existing online-booked appointment (marked it `completed`, entered a
charge, confirmed it displayed correctly with the new blue "Completed"
badge and the charge inline); created a brand-new manual walk-in entry
end to end (form → real database row, correctly tagged `(manual)`,
correctly sorted into its date group). All test data was reverted to its
original state afterward — the two real test bookings the user had
already made through the live form were restored to `pending`/no-charge,
and the synthetic walk-in entry was deleted.
