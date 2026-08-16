import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { appointments, blockedDates, clinicHours } from "@/db/schema";

// "YYYY-MM-DD" -> 0 (Sunday) .. 6 (Saturday), matching clinicHours.dayOfWeek
// and JS Date#getDay(). Built from local date parts, not `new Date(dateStr)`
// directly — that parses as UTC midnight and can shift a day depending on
// the server's timezone, which would compute the wrong weekday near
// midnight. Constructing from the parsed year/month/day in local time
// avoids that shift entirely.
function dayOfWeekFor(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Returns every bookable "HH:MM" slot for a given date: empty if the date
 * is in blocked_dates (dentist marked it unavailable) or the clinic is
 * closed that weekday, otherwise every slot minus ones already taken by a
 * pending or confirmed appointment. Cancelled appointments don't block a
 * slot — the whole point of tracking status is that a cancelled booking
 * frees the time back up.
 */
export async function getAvailableSlots(dateStr: string): Promise<string[]> {
  const [blocked] = await db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.date, dateStr))
    .limit(1);
  if (blocked) return [];

  const dayOfWeek = dayOfWeekFor(dateStr);

  const [hours] = await db
    .select()
    .from(clinicHours)
    .where(eq(clinicHours.dayOfWeek, dayOfWeek))
    .limit(1);

  if (!hours || hours.isClosed || !hours.opensAt || !hours.closesAt) {
    return [];
  }

  const booked = await db
    .select({ time: appointments.appointmentTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, dateStr),
        ne(appointments.status, "cancelled"),
      ),
    );
  const bookedTimes = new Set(booked.map((b) => b.time.slice(0, 5))); // "HH:MM:SS" -> "HH:MM"

  const openMinutes = timeStringToMinutes(hours.opensAt.slice(0, 5));
  const closeMinutes = timeStringToMinutes(hours.closesAt.slice(0, 5));

  const slots: string[] = [];
  for (let m = openMinutes; m + hours.slotMinutes <= closeMinutes; m += hours.slotMinutes) {
    const slot = minutesToTimeString(m);
    if (!bookedTimes.has(slot)) slots.push(slot);
  }

  return slots;
}

/**
 * Re-validates a single requested slot is still open, right before booking
 * it — the list returned by getAvailableSlots can go stale between when a
 * patient loads it and when they submit (someone else could book the same
 * slot in between). This is the actual guard against double-booking; the
 * slot list in the UI is just a convenience, not the source of truth.
 */
export async function isSlotAvailable(dateStr: string, time: string): Promise<boolean> {
  const slots = await getAvailableSlots(dateStr);
  return slots.includes(time);
}
