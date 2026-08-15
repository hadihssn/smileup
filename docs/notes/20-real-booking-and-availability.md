# 20 — Wiring the booking form to a real backend, with actual availability

**Commit:** `feat: wire booking form to real database with availability checking`
**Files:** `src/lib/availability.ts`, `src/app/actions/booking.ts`,
`src/components/sections/Booking.tsx`, `src/db/schema.ts` (unique index)

## What this was

The booking form went from "sets local React state and shows a fake
success message" ([12](12-booking-form.md)) to actually writing a real
row into the `appointments` table — the first genuinely functional piece
of the product, not just the marketing site. This is also the first time
the app calls the database from user-facing code, so it's worth being
careful and explicit about *why* each piece exists.

## Server Actions, not an API route

`src/app/actions/booking.ts` starts with `"use server"` — a Next.js
**Server Action**. This is a function that's defined and runs on the
server, but can be imported and called directly from a Client Component
(`Booking.tsx`) as if it were a normal async function — no hand-written
`fetch("/api/...")`, no API route file, no manually parsing a JSON body.
Next.js turns the call into a network request under the hood. Chosen over
a traditional API route because there's no need for this endpoint to be
called from anywhere except this one form — a public REST endpoint would
be more surface area for no benefit yet.

## Why availability logic is a separate file from the Server Action

`src/lib/availability.ts` holds the actual slot-computation logic;
`src/app/actions/booking.ts` is a thin wrapper that calls it. Two reasons
to keep them apart:
- The admin dashboard (task #6/#7, coming up) will need to know
  availability too — e.g. to show the dentist open slots when manually
  entering a walk-in appointment. Keeping the logic in `lib/` means it's
  reusable from anywhere server-side, not trapped inside one action file.
- `"use server"` files have a special constraint: **every exported
  function becomes a callable network endpoint**. A helper function like
  `dayOfWeekFor` has no business being network-callable — keeping it in a
  plain module avoids accidentally expanding the app's public surface
  area just because a function happened to live in the same file.

## How slot computation works

`getAvailableSlots(dateStr)`:
1. Looks up the `clinic_hours` row for that date's weekday.
2. If closed (or no row), returns no slots — matches the `isClosed`
   design from [18](18-appointments-schema.md).
3. Otherwise walks from `opensAt` to `closesAt` in `slotMinutes`
   increments, producing every possible slot.
4. Fetches existing non-cancelled appointments for that date and removes
   any slot that's already taken.

A subtlety worth flagging: `dayOfWeekFor` deliberately does **not** use
`new Date(dateStr).getDay()`. Parsing a plain `"YYYY-MM-DD"` string that
way makes JavaScript treat it as UTC midnight, then `.getDay()` converts
*back* to local time — on a server whose local timezone is behind UTC,
that can silently compute the wrong weekday for dates near midnight.
Building the `Date` from the split year/month/day numbers instead
(`new Date(year, month - 1, day)`) treats them as local components
directly, sidestepping the conversion entirely.

## Two layers of double-booking protection, not one

This is the part worth understanding in depth, because it's a genuine
correctness issue, not just style:

1. **The slot list is a convenience, not a guarantee.** The list
   `getAvailableSlots` returns can go stale the instant another patient
   books the same slot — there's a real window between "patient loads the
   page" and "patient clicks submit." `submitBooking` re-checks
   `isSlotAvailable` right before inserting, which shrinks that window
   but doesn't close it — two submissions could still both pass the check
   microseconds apart.
2. **The actual guarantee is a database constraint.** `appointments` now
   has a **partial unique index**:
   ```ts
   uniqueIndex("appointments_active_slot_unique")
     .on(table.appointmentDate, table.appointmentTime)
     .where(sql`${table.status} <> 'cancelled'`)
   ```
   This tells Postgres itself to reject a second insert for the same
   date+time, full stop — no race condition possible, because the
   database is the single point of truth enforcing it atomically. It's
   *partial* (the `WHERE` clause) so that a cancelled appointment doesn't
   permanently block its old slot from being rebooked.

The application-level check (#1) exists purely for a good error message
("that time was just booked, pick another") — without it, the same race
would still be *prevented*, just with an ugly raw database error bubbling
up instead of a clean one. The index is the correctness guarantee; the
check is the UX.

## The booking form UI

- Picking a date now triggers a fetch (`fetchAvailableSlots`) for that
  day's open slots, which populates a second dropdown — previously there
  was no time selection at all, only a date.
- The date input has `min={today}` so the browser's own picker won't
  offer past dates.
- Loading state is deliberately **derived**, not stored directly:
  ```ts
  const [slotsFor, setSlotsFor] = useState<{ date: string; slots: string[] }>({ date: "", slots: [] });
  const loadingSlots = formData.date !== "" && slotsFor.date !== formData.date;
  ```
  instead of a separate `loadingSlots` boolean set to `true` synchronously
  at the top of the effect. This wasn't a style preference — the
  project's ESLint config (`eslint-config-next`'s React Compiler rules)
  actively rejects calling `setState` synchronously inside an effect body,
  because it can trigger cascading re-renders. Every `setState` call in
  the effect now happens inside the `.then()` callback of the fetch —
  legitimate "an external system told me something changed" state
  updates — and "loading" is computed by comparing what date the fetched
  slots belong to against the currently selected date, rather than being
  its own tracked flag.
- On submit failure (stale slot, network error), the form shows the
  server's error message inline and lets the patient try again, instead
  of silently doing nothing or crashing.

## Verified against the real database

Not just type-checked — actually run end-to-end against the live Neon
database: submitted a real booking through the running app, confirmed
the row landed correctly, confirmed the booked slot then disappeared from
`getAvailableSlots` for that date, then deleted the test row. This is the
same "compiling isn't the same as working" principle from
[16](16-browser-verification-and-mobile-fix.md), now applied to a real
backend instead of just UI layout.
