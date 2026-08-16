"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { appointments, blockedDates } from "@/db/schema";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/appointments";

// Every exported function in a "use server" file becomes a callable
// network endpoint (see docs/notes/20's note on this). The route-level
// protection from src/proxy.ts covers these too, *as long as they're only
// ever invoked from a form on the /admin page* — the POST still lands on
// a URL the middleware matches. But after the proxy.ts placement bug in
// docs/notes/21 (a route silently unprotected because of a misplaced
// file), these mutating actions each check the session directly too,
// rather than trusting route-level protection alone. Belt and suspenders,
// same reasoning as the booking form's double-booking guard.
async function requireSession() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || (status !== "confirmed" && status !== "cancelled")) return;

  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(eq(appointments.id, id));

  revalidatePath("/admin");
}

export async function blockDateAction(formData: FormData) {
  await requireSession();

  const date = formData.get("date") as string;
  const reason = (formData.get("reason") as string)?.trim();
  if (!date) return;

  await db
    .insert(blockedDates)
    .values({ date, reason: reason || undefined })
    .onConflictDoNothing({ target: blockedDates.date });

  revalidatePath("/admin");
}

export async function unblockDateAction(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(blockedDates).where(eq(blockedDates.id, id));
  revalidatePath("/admin");
}

/**
 * Shared by create and update — pulls the common appointment fields out of
 * a submitted form and validates them. Returns null on anything invalid
 * rather than throwing, since both callers need to redirect back to the
 * form with an error rather than crash the request.
 */
function parseAppointmentForm(formData: FormData) {
  const patientName = (formData.get("patientName") as string)?.trim();
  const patientPhone = (formData.get("patientPhone") as string)?.trim();
  const serviceId = (formData.get("serviceId") as string) || undefined;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string)?.trim();
  const chargeRaw = (formData.get("chargeAmount") as string)?.trim();

  if (!patientName || !patientPhone || !date || !time) return null;
  if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) return null;

  const chargeAmount = chargeRaw ? Number.parseInt(chargeRaw, 10) : null;
  if (chargeRaw && (Number.isNaN(chargeAmount) || chargeAmount! < 0)) return null;

  return {
    patientName,
    patientPhone,
    serviceId,
    appointmentDate: date,
    appointmentTime: time,
    status: status as AppointmentStatus,
    notes: notes || undefined,
    chargeAmount,
  };
}

export async function createAppointmentAction(formData: FormData) {
  await requireSession();

  const parsed = parseAppointmentForm(formData);
  if (!parsed) {
    redirect("/admin/appointments/new?error=" + encodeURIComponent("Please fill in all required fields."));
  }

  try {
    await db.insert(appointments).values({ ...parsed, isManualEntry: true });
  } catch {
    // Most likely the same active-slot unique index used for online
    // bookings (docs/notes/20) — a manual entry at a slot that's already
    // taken by another non-cancelled appointment.
    redirect(
      "/admin/appointments/new?error=" +
        encodeURIComponent("That date and time already has an appointment. Pick another."),
    );
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateAppointmentAction(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  const parsed = parseAppointmentForm(formData);
  if (!parsed) {
    redirect(`/admin/appointments/${id}/edit?error=` + encodeURIComponent("Please fill in all required fields."));
  }

  try {
    await db
      .update(appointments)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(appointments.id, id));
  } catch {
    redirect(
      `/admin/appointments/${id}/edit?error=` +
        encodeURIComponent("That date and time already has another appointment. Pick another."),
    );
  }

  revalidatePath("/admin");
  redirect("/admin");
}
