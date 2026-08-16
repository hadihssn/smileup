import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import type { AppointmentRow } from "./appointments";

/** "2026-08" -> ["2026-08-01", "2026-09-01") — a half-open date range,
 * which is what makes filtering by month correct and index-friendly:
 * comparing appointmentDate against two bounds rather than pattern-
 * matching the string, and correctly handling December -> January. */
function monthBounds(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

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
}

export async function getRevenueSummary(yearMonth: string): Promise<RevenueSummary> {
  const { start, end } = monthBounds(yearMonth);
  const previousMonth = shiftMonth(yearMonth, -1);

  const [current, previous, rows, missingChargeRows] = await Promise.all([
    getMonthTotal(yearMonth),
    getMonthTotal(previousMonth),
    db
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
      .where(
        and(
          eq(appointments.status, "completed"),
          gte(appointments.appointmentDate, start),
          lt(appointments.appointmentDate, end),
        ),
      )
      .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime)),
    db
      .select({ count: sql<string>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, "completed"),
          gte(appointments.appointmentDate, start),
          lt(appointments.appointmentDate, end),
          sql`${appointments.chargeAmount} is null`,
        ),
      ),
  ]);

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
  };
}
