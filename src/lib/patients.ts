import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import type { AppointmentStatus } from "./appointments";
import { monthBounds } from "./dateRange";

// A "patient" here is derived by grouping appointments on phone number —
// there's deliberately no separate patients table. Phone is the natural
// identity key (two real patients essentially never share one), and
// everything below (last visit, lifetime spend, recall status) can be
// computed directly from appointments that already exist. A dedicated
// table only earns its keep once something needs to live *on the patient*
// rather than on a visit (medical history, allergies) — see the same
// reasoning in docs/notes/24 about appointments not having a patients FK.

const RECALL_WINDOW_DAYS = 182; // ~6 months — dental checkups are typically twice a year

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface PatientAppointmentRow {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  serviceId: string | null;
  serviceTitle: string | null;
  chargeAmount: number | null;
  isManualEntry: boolean;
  notes: string | null;
}

/** Every appointment, oldest first, joined with service title. Ascending
 * order matters: every summary below is built by walking rows in order
 * and overwriting "latest known" fields as it goes, so the last write for
 * any given patient is naturally the most recent one. */
async function getAllAppointmentsForPatients(): Promise<PatientAppointmentRow[]> {
  return db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      patientPhone: appointments.patientPhone,
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
      status: appointments.status,
      serviceId: appointments.serviceId,
      serviceTitle: services.title,
      chargeAmount: appointments.chargeAmount,
      isManualEntry: appointments.isManualEntry,
      notes: appointments.notes,
    })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime));
}

export interface PatientSummary {
  phone: string;
  name: string;
  totalCompletedVisits: number;
  firstVisitDate: string | null;
  lastVisitDate: string | null;
  lastTreatment: string | null;
  lifetimeRevenue: number;
  upcomingDate: string | null;
  /** Had at least one completed visit 6+ months ago, and nothing booked
   * since — a candidate for a recall reminder. Patients with zero
   * completed visits are never "overdue": there's nothing to recall them
   * for yet. */
  isOverdueForRecall: boolean;
  /** Every distinct service this patient has ever completed a visit for —
   * not just their most recent one. Filtering "who's had veneers" should
   * find someone whose last visit was a cleaning but who had veneers done
   * two visits ago, not just whoever's *most recent* treatment matches. */
  serviceIdsReceived: string[];
}

function buildPatientSummaries(rows: PatientAppointmentRow[]): PatientSummary[] {
  const today = todayStr();
  const recallCutoff = daysAgoStr(RECALL_WINDOW_DAYS);
  const map = new Map<string, PatientSummary>();
  const serviceSets = new Map<string, Set<string>>();

  for (const row of rows) {
    let p = map.get(row.patientPhone);
    if (!p) {
      p = {
        phone: row.patientPhone,
        name: row.patientName,
        totalCompletedVisits: 0,
        firstVisitDate: null,
        lastVisitDate: null,
        lastTreatment: null,
        lifetimeRevenue: 0,
        upcomingDate: null,
        isOverdueForRecall: false,
        serviceIdsReceived: [],
      };
      map.set(row.patientPhone, p);
      serviceSets.set(row.patientPhone, new Set());
    }
    p.name = row.patientName; // rows are ascending, so this ends up as the latest name on file

    if (row.status === "completed") {
      p.totalCompletedVisits += 1;
      if (!p.firstVisitDate) p.firstVisitDate = row.date;
      p.lastVisitDate = row.date;
      p.lastTreatment = row.serviceTitle;
      if (row.chargeAmount != null) p.lifetimeRevenue += row.chargeAmount;
      if (row.serviceId) serviceSets.get(row.patientPhone)!.add(row.serviceId);
    }
    if ((row.status === "pending" || row.status === "confirmed") && row.date >= today) {
      if (!p.upcomingDate || row.date < p.upcomingDate) p.upcomingDate = row.date;
    }
  }

  const list = [...map.values()];
  for (const p of list) {
    p.serviceIdsReceived = [...(serviceSets.get(p.phone) ?? [])];
  }
  for (const p of list) {
    p.isOverdueForRecall = !!p.lastVisitDate && p.lastVisitDate < recallCutoff && !p.upcomingDate;
  }

  // Most recently active patients first; anyone with no completed visit
  // yet (a pending/cancelled-only record) sorts to the bottom rather than
  // interleaving with real visit history.
  list.sort((a, b) => {
    if (!a.lastVisitDate && !b.lastVisitDate) return 0;
    if (!a.lastVisitDate) return 1;
    if (!b.lastVisitDate) return -1;
    return b.lastVisitDate.localeCompare(a.lastVisitDate);
  });

  return list;
}

export interface PatientMonthStats {
  /** Everyone who has ever appeared in an appointment, any status — the
   * "who has contacted this clinic" number, matching how the dentist
   * would naturally think of his customer base. */
  totalPatients: number;
  /** Had a completed visit this month, and their first-ever completed
   * visit was also this month. */
  newThisMonth: number;
  /** Had a completed visit this month, but had already completed at
   * least one visit before this month. */
  returningThisMonth: number;
}

function buildMonthStats(rows: PatientAppointmentRow[], yearMonth: string): PatientMonthStats {
  const { start, end } = monthBounds(yearMonth);
  const allPatients = new Set<string>();
  const firstCompletedVisit = new Map<string, string>();
  const completedThisMonth = new Set<string>();

  for (const row of rows) {
    allPatients.add(row.patientPhone);
    if (row.status === "completed") {
      const existing = firstCompletedVisit.get(row.patientPhone);
      if (!existing || row.date < existing) firstCompletedVisit.set(row.patientPhone, row.date);
      if (row.date >= start && row.date < end) completedThisMonth.add(row.patientPhone);
    }
  }

  let newThisMonth = 0;
  let returningThisMonth = 0;
  for (const phone of completedThisMonth) {
    const first = firstCompletedVisit.get(phone)!;
    if (first >= start && first < end) newThisMonth += 1;
    else returningThisMonth += 1;
  }

  return { totalPatients: allPatients.size, newThisMonth, returningThisMonth };
}

export interface PatientsOverview {
  patients: PatientSummary[];
  stats: PatientMonthStats;
}

export async function getPatientsOverview(yearMonth: string): Promise<PatientsOverview> {
  const rows = await getAllAppointmentsForPatients();
  return { patients: buildPatientSummaries(rows), stats: buildMonthStats(rows, yearMonth) };
}

export interface PatientDetail {
  summary: PatientSummary;
  visits: PatientAppointmentRow[];
}

export async function getPatientDetail(phone: string): Promise<PatientDetail | null> {
  const rows = (await getAllAppointmentsForPatients()).filter((r) => r.patientPhone === phone);
  if (rows.length === 0) return null;

  const [summary] = buildPatientSummaries(rows);
  // Most recent visit first, for a reverse-chronological history view.
  const visits = [...rows].reverse();
  return { summary, visits };
}
