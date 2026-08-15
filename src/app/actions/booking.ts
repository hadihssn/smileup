"use server";

import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAvailableSlots, isSlotAvailable } from "@/lib/availability";

export async function fetchAvailableSlots(dateStr: string): Promise<string[]> {
  if (!dateStr) return [];
  return getAvailableSlots(dateStr);
}

export interface BookingInput {
  name: string;
  phone: string;
  serviceTitle: string;
  date: string;
  time: string;
  message?: string;
}

export type BookingResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const { name, phone, serviceTitle, date, time, message } = input;

  if (!name.trim() || !phone.trim() || !date || !time) {
    return { ok: false, error: "Please fill in your name, phone, date, and time." };
  }

  // Re-check availability server-side right before writing — the slot list
  // the client has could be stale by the time they submit. This is a
  // belt-and-suspenders check on top of the DB's own unique index: catching
  // it here gives a clear error message, the index is the actual guarantee.
  const stillOpen = await isSlotAvailable(date, time);
  if (!stillOpen) {
    return { ok: false, error: "That time slot was just booked. Please pick another." };
  }

  const matchedService = serviceTitle
    ? await db.query.services.findFirst({ where: eq(services.title, serviceTitle) })
    : undefined;

  try {
    await db.insert(appointments).values({
      patientName: name.trim(),
      patientPhone: phone.trim(),
      serviceId: matchedService?.id,
      appointmentDate: date,
      appointmentTime: time,
      notes: message?.trim() || undefined,
    });
  } catch {
    // Most likely the unique index rejected a race-condition double-booking.
    return { ok: false, error: "That time slot was just booked. Please pick another." };
  }

  return { ok: true };
}
