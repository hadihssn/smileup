// Shared by every paginated list (appointments, revenue's completed-
// visits breakdown, patients, a patient's visit history) and the
// Pagination UI component — kept in lib/, not the component file, so
// data-layer code (appointments.ts, revenue.ts) doesn't have to import a
// UI component just to get a number.
export const PAGE_SIZE = 10;

/** Clamps a raw ?page= value to a valid, safe page number. */
export function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function totalPagesFor(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
}
