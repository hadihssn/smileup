import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  time,
  date,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// services — mirrors the shape currently hardcoded in src/data/site.ts.
// Moved into the DB so the admin dashboard can eventually edit these
// without a code deploy; the booking form reads from here once wired up.
// ---------------------------------------------------------------------------
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // e.g. "TW" — kept from the static data for continuity
  title: text("title").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// clinic_hours — one row per weekday, defining when the clinic is open and
// how long each bookable slot is. A closed day (e.g. Sunday) is represented
// as isClosed = true rather than omitting the row, so every weekday has an
// explicit, queryable record instead of "no row = closed" being implicit.
// ---------------------------------------------------------------------------
export const clinicHours = pgTable("clinic_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayOfWeek: integer("day_of_week").notNull().unique(), // 0 = Sunday .. 6 = Saturday, matches JS Date#getDay()
  isClosed: boolean("is_closed").notNull().default(false),
  opensAt: time("opens_at"), // null when isClosed
  closesAt: time("closes_at"), // null when isClosed
  slotMinutes: integer("slot_minutes").notNull().default(30),
});

// ---------------------------------------------------------------------------
// blocked_dates — one-off exceptions to the recurring weekly schedule in
// clinic_hours (a holiday, the dentist being away, etc). Kept as its own
// table rather than a flag on clinic_hours because these are exceptions
// to a specific calendar date, not a change to the recurring weekly
// pattern — clinic_hours answers "what does a normal Tuesday look like,"
// this table answers "is this particular date different."
// ---------------------------------------------------------------------------
export const blockedDates = pgTable("blocked_dates", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().unique(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// appointments — the core booking record. patientName/Phone are stored
// directly rather than as a separate "patients" table for now: this project
// doesn't have patient accounts/logins, and a normalized patients table
// would be speculative complexity until there's an actual reason for it
// (e.g. patient history lookups in a later phase).
// ---------------------------------------------------------------------------
export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone").notNull(),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    appointmentDate: date("appointment_date").notNull(),
    appointmentTime: time("appointment_time").notNull(),
    status: appointmentStatus("status").notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Guards against double-booking at the database level, not just in
    // application code — two concurrent requests for the same slot can't
    // both succeed, the second one's insert will violate this and fail.
    // Excludes cancelled appointments so a freed-up slot can be rebooked.
    uniqueIndex("appointments_active_slot_unique")
      .on(table.appointmentDate, table.appointmentTime)
      .where(sql`${table.status} <> 'cancelled'`),
  ],
);
