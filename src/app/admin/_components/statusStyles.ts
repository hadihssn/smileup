import type { AppointmentStatus } from "@/lib/appointments";

// Shared between the appointments list and the patient detail page (both
// render status badges for the same underlying appointment rows).
// Record<AppointmentStatus, string> means adding a status to the schema's
// enum without adding it here is a type error, not a silently unstyled
// badge — see docs/notes/22 on the original reasoning.
export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  confirmed: "bg-brand-tint text-brand-dark ring-1 ring-inset ring-brand/20",
  completed: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  cancelled: "bg-slate-100 text-slate-500 line-through ring-1 ring-inset ring-slate-200",
};
