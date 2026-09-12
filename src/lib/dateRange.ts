// Pure date-range math shared by anything that needs to filter or bucket
// by calendar month (revenue.ts, patients.ts). Kept separate from
// format.ts (which is about *display* formatting) — this is query logic.

/** "2026-08" -> ["2026-08-01", "2026-09-01") — a half-open date range,
 * which is what makes filtering by month correct and index-friendly:
 * comparing appointmentDate against two bounds rather than pattern-
 * matching the string, and correctly handling December -> January. */
export function monthBounds(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}
