import { asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, appointmentStatus, services } from "@/db/schema";
import { PAGE_SIZE, totalPagesFor } from "./pagination";

export type AppointmentView = "today" | "upcoming" | "all";

// Derived from the schema's enum, not retyped by hand — adding a status
// to appointmentStatus in schema.ts automatically flows through to every
// place that types against AppointmentStatus, instead of a second literal
// list quietly drifting out of sync with the database.
export type AppointmentStatus = (typeof appointmentStatus.enumValues)[number];
export const APPOINTMENT_STATUSES = appointmentStatus.enumValues;

export interface AppointmentRow {
  id: string;
  patientName: string;
  patientPhone: string;
  serviceId: string | null;
  serviceTitle: string | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  chargeAmount: number | null;
  isManualEntry: boolean;
  notes: string | null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const ROW_SHAPE = {
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
};

export interface AppointmentsPage {
  rows: AppointmentRow[];
  page: number;
  totalPages: number;
  totalCount: number;
}

/**
 * Fetches one page of appointments for the admin dashboard, joined with
 * the service title so the list is readable without a second lookup.
 * "today" and "upcoming" both sort soonest-first (the dentist wants to
 * see what's next); "all" sorts most-recent-first (a history view, where
 * the point is scrolling back through what already happened).
 *
 * Real LIMIT/OFFSET pagination, not a post-fetch slice — this is a plain
 * filtered/sorted row list with no cross-row aggregation, so the database
 * only ever does the work for one page's worth of rows, not the whole
 * table. (Contrast with patients.ts, where per-patient stats need the
 * full history and can only be paginated after the fact — see its own
 * note on that.)
 */
export async function getAppointments(view: AppointmentView, page = 1): Promise<AppointmentsPage> {
  const today = todayStr();
  const dateFilter =
    view === "today"
      ? eq(appointments.appointmentDate, today)
      : view === "upcoming"
        ? gte(appointments.appointmentDate, today)
        : sql`true`;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(dateFilter);

  const totalPages = totalPagesFor(count);
  const safePage = Math.min(Math.max(1, page), totalPages);

  const rows = await db
    .select(ROW_SHAPE)
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(dateFilter)
    .orderBy(
      view === "all" ? desc(appointments.appointmentDate) : asc(appointments.appointmentDate),
      view === "all" ? desc(appointments.appointmentTime) : asc(appointments.appointmentTime),
    )
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);

  return { rows, page: safePage, totalPages, totalCount: count };
}

export async function getAppointmentById(id: string): Promise<AppointmentRow | undefined> {
  const [row] = await db
    .select(ROW_SHAPE)
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, id))
    .limit(1);
  return row;
}
