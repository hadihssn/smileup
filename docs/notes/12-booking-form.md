# 12 — Appointment booking form

**Commit:** `feat: build Appointment booking form`
**Files:** `src/components/sections/Booking.tsx`

## What this does

A form (name, phone, treatment, date, message) that, on submit, replaces
itself with a "Request received!" confirmation — no backend yet, since
there isn't a booking system to send this to (see the design handoff's
notes on what production would eventually need to wire this to).

## Key concepts

**Controlled inputs.** Every field's `value` comes from React state
(`formData.name`, etc.), and every keystroke calls `onChange` to update
that state:

```tsx
<input value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
```

This is React's "controlled component" pattern: the DOM input never holds
its own independent value — React state is the single source of truth, and
the input just reflects it. The alternative (an "uncontrolled" input, read
via a ref only when needed) is simpler but makes validation, conditional
logic, and — later — sending the whole form as one object much harder.
Since this form eventually needs to submit `formData` as a whole to a real
booking API, controlled inputs are the right call from the start.

**A small generic helper instead of five near-identical handlers.** The
original design (see `design-reference/`) wrote a separate
`updateField_name`, `updateField_phone`, `updateField_date`, etc. handler
per input. Here that collapses to one generic function:

```ts
function updateField<K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) {
  setFormData((prev) => ({ ...prev, [field]: value }));
}
```

The `<K extends keyof BookingFormData>` generic keeps this type-safe:
`updateField("phone", 123)` would be a TypeScript error (phone expects a
`string`), even though the function body itself doesn't hardcode which
field it's updating.

**Conditional rendering for the success state.** `submitted` is a single
boolean that decides whether the form fields or the confirmation message
render — `{submitted ? <Confirmation /> : <FormFields />}`. No separate
"hide the form" and "show the message" logic; one piece of state, one
ternary.

**Two individual `useReveal()` calls instead of the shared `Reveal`
component.** Unlike the sections that map over arrays
([06](06-reveal-component-and-approach-section.md)), this section has
exactly two things to reveal (the text column, the form) and is *already*
a Client Component because of the form's `useState`. So it calls the
`useReveal` hook directly, twice, at the component's top level — perfectly
fine per the Rules of Hooks, since it's not inside a loop or condition.
`Reveal` earns its keep specifically for repeated/mapped content; for a
fixed, known number of elements, calling the hook directly is simpler.
