import { asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";

export type AppointmentView = "today" | "upcoming" | "all";

export interface AppointmentRow {
  id: string;
  patientName: string;
  patientPhone: string;
  serviceTitle: string | null;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

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

  const rows = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      patientPhone: appointments.patientPhone,
      serviceTitle: services.title,
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
      status: appointments.status,
      notes: appointments.notes,
    })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(dateFilter)
    .orderBy(
      view === "all" ? desc(appointments.appointmentDate) : asc(appointments.appointmentDate),
      view === "all" ? desc(appointments.appointmentTime) : asc(appointments.appointmentTime),
    );

  return rows;
}
