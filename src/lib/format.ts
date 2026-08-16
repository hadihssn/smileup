// Shared date/time display formatting — used by both the booking form
// (Booking.tsx) and the admin dashboard, so a slot like "14:30" always
// reads the same way ("2:30 PM") everywhere in the app.

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// "YYYY-MM-DD" -> "Mon, Aug 20". Built from local date parts rather than
// `new Date(dateStr)` directly, for the same reason as availability.ts's
// dayOfWeekFor: parsing a plain date string as UTC and converting back to
// local time can shift the displayed day near midnight depending on the
// server's timezone.
export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Whole PKR, no decimals — matches how chargeAmount is stored (see
// docs/notes/24 on why it's a plain integer, not a decimal type).
export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString("en-US")}`;
}
