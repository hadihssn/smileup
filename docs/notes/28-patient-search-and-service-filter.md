# 28 — Searching patients by name/phone and filtering by service

**Commit:** `feat: add patient search and service filter`
**Files:** `src/lib/patients.ts`, `src/app/admin/patients/page.tsx`

## What this was

Two quick, high-value additions to the Patients list from
[27](27-patient-insights.md): a text search (name or phone) and a filter
by which service a patient has ever received — so the dentist can
actually find someone ("who was that patient... Sara something?") or
answer a question like "who have I done veneers for?"

## Filtering by *every* service ever received, not just the last one

`PatientSummary` already tracked `lastTreatment` (a display string) from
[27](27-patient-insights.md), but that's only the *most recent* visit's
service — using it for filtering would mean a patient who had veneers two
visits ago, then a cleaning last week, wouldn't show up under a "Veneers"
filter at all, even though they're exactly who the dentist is looking
for. `serviceIdsReceived` is new: a set of every distinct service ID a
patient has ever completed a visit for, built the same way as everything
else in `buildPatientSummaries` — walked once per patient across their
full history, not just their latest row. Verified directly: filtering by
Veneers correctly returned both a patient whose *most recent* visit was
veneers and one whose *only* visit was veneers months ago — the filter
looks at full history, not the display shortcut.

Filtering by service ID (not title) matches the same convention already
used in the appointment edit form ([25](25-manual-entry-and-editing.md)) —
titles are just display strings, IDs are the stable thing to compare
against.

## Search and filters as a plain GET form, not client state

The search box and service dropdown are a normal `<form action="/admin/patients">`
with no JavaScript — submitting it just navigates to
`/admin/patients?q=...&service=...&filter=...`. This keeps the same
property every other filter in this admin section already has
(`?view=`, `?month=`): the current search is a real URL, bookmarkable
and shareable, and refreshing the page doesn't lose it. The All/Overdue
toggle links now carry the current search/service forward too (via
`URLSearchParams`), so switching between them doesn't silently clear
what the dentist just searched for.

## Verified against the real (now-populated) database

Searched "sara" and got exactly one match; filtered by Veneers and got
both matching patients, one of whom had it as a non-final visit,
confirming the full-history tracking works as intended rather than only
catching the display-shortcut case.
