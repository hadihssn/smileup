"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { appointments, blockedDates } from "@/db/schema";

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
