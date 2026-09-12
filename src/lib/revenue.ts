import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import type { AppointmentRow } from "./appointments";
import { monthBounds } from "./dateRange";
import { PAGE_SIZE, totalPagesFor } from "./pagination";

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function shiftMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

interface MonthTotal {
  total: number;
  count: number;
}

/** Only "completed" appointments count — see docs/notes/24 on why revenue
 * is scoped to visits that actually happened, not just ones that were
 * scheduled. `chargeAmount` can still be null on a completed row (staff
 * forgot to enter it) — those are excluded from the sum via the SQL
 * filter below rather than counted as zero, so a missing charge doesn't
 * silently understate revenue as if it were confirmed to be free. */
async function getMonthTotal(yearMonth: string): Promise<MonthTotal> {
  const { start, end } = monthBounds(yearMonth);
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${appointments.chargeAmount}), 0)`,
      count: sql<string>`count(*)`,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.status, "completed"),
        gte(appointments.appointmentDate, start),
        lt(appointments.appointmentDate, end),
        sql`${appointments.chargeAmount} is not null`,
      ),
    );
  return { total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) };
}

export interface RevenueSummary {
  month: string;
  total: number;
  count: number;
  previousMonth: string;
  previousTotal: number;
  changePercent: number | null;
  appointments: AppointmentRow[];
  /** Completed visits this month with no charge entered — worth
   * surfacing so the dentist notices unrecorded revenue rather than the
   * total silently looking lower than it should. */
  missingChargeCount: number;
  page: number;
  totalPages: number;
}

export async function getRevenueSummary(yearMonth: string, page = 1): Promise<RevenueSummary> {
  const { start, end } = monthBounds(yearMonth);
  const previousMonth = shiftMonth(yearMonth, -1);
  const monthFilter = and(
    eq(appointments.status, "completed"),
    gte(appointments.appointmentDate, start),
    lt(appointments.appointmentDate, end),
  );

  const [current, previous, [{ breakdownCount }], missingChargeRows] = await Promise.all([
    getMonthTotal(yearMonth),
    getMonthTotal(previousMonth),
    db.select({ breakdownCount: sql<number>`count(*)::int` }).from(appointments).where(monthFilter),
    db
      .select({ count: sql<string>`count(*)` })
      .from(appointments)
      .where(and(monthFilter, sql`${appointments.chargeAmount} is null`)),
  ]);

  const totalPages = totalPagesFor(breakdownCount);
  const safePage = Math.min(Math.max(1, page), totalPages);

  // The breakdown list (this page's rows) is paginated with LIMIT/OFFSET
  // — it's a plain filtered/sorted list, not an aggregate, so only this
  // page's rows are ever fetched. The totals above (getMonthTotal) are
  // separate, always-unpaginated aggregate queries over the whole month —
  // they must never be affected by which page of the breakdown is showing.
  const rows = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      patientPhone: appointments.patientPhone,
      serviceId: appointments.serviceId,
      serviceTitle: services.title,
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
      status: appointments.status,
      chargeAmount: appointments.chargeAmount,
      isManualEntry: appointments.isManualEntry,
      notes: appointments.notes,
    })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(monthFilter)
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime))
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);

  const changePercent =
    previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : null;

  return {
    month: yearMonth,
    total: current.total,
    count: current.count,
    previousMonth,
    previousTotal: previous.total,
    changePercent,
    appointments: rows,
    missingChargeCount: Number(missingChargeRows[0]?.count ?? 0),
    page: safePage,
    totalPages,
  };
}
