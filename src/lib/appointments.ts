import { asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, appointmentStatus, services } from "@/db/schema";

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

/**
 * Fetches appointments for the admin dashboard, joined with the service
 * title so the list is readable without a second lookup. "today" and
 * "upcoming" both sort soonest-first (the dentist wants to see what's next);
 * "all" sorts most-recent-first (a history view, where the point is
 * scrolling back through what already happened).
 */
export async function getAppointments(view: AppointmentView): Promise<AppointmentRow[]> {
  const today = todayStr();
  const dateFilter =
    view === "today"
      ? eq(appointments.appointmentDate, today)
      : view === "upcoming"
        ? gte(appointments.appointmentDate, today)
        : sql`true`;

  return db
    .select(ROW_SHAPE)
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(dateFilter)
    .orderBy(
      view === "all" ? desc(appointments.appointmentDate) : asc(appointments.appointmentDate),
      view === "all" ? desc(appointments.appointmentTime) : asc(appointments.appointmentTime),
    );
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
