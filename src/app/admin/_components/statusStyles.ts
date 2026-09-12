import type { AppointmentStatus } from "@/lib/appointments";

// Shared between the appointments list and the patient detail page (both
// render status badges for the same underlying appointment rows).
// Record<AppointmentStatus, string> means adding a status to the schema's
// enum without adding it here is a type error, not a silently unstyled
// badge — see docs/notes/22 on the original reasoning.
export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-tint text-brand-dark",
  completed: "bg-sky-100 text-sky-800",
  cancelled: "bg-line text-muted line-through",
};
