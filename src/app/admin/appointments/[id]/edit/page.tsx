import { auth } from "@/lib/auth/server";
import { redirect, notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/appointments";
import { getServices } from "@/lib/services";
import { updateAppointmentAction } from "../../../actions";
import { AppointmentForm } from "../../../_components/AppointmentForm";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;
  const { error } = await searchParams;
  const [appointment, services] = await Promise.all([getAppointmentById(id), getServices()]);

  if (!appointment) notFound();

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Edit appointment</h1>
        <p className="mb-6 text-[13.5px] text-muted">
          {appointment.isManualEntry ? "Manually entered" : "Booked online"} · created for{" "}
          {appointment.patientName}
        </p>
        <AppointmentForm
          action={updateAppointmentAction}
          services={services}
          defaultValues={appointment}
          submitLabel="Save changes"
          error={error}
        />
      </div>
    </main>
  );
}
