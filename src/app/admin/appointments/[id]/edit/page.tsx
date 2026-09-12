import { notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/appointments";
import { getServices } from "@/lib/services";
import { updateAppointmentAction } from "../../../actions";
import { AppointmentForm } from "../../../_components/AppointmentForm";
import { PageHeader } from "../../../_components/PageHeader";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [appointment, services] = await Promise.all([getAppointmentById(id), getServices()]);

  if (!appointment) notFound();

  return (
    <>
      <PageHeader
        title="Edit appointment"
        subtitle={`${appointment.isManualEntry ? "Manually entered" : "Booked online"} · created for ${appointment.patientName}`}
      />
      <AppointmentForm
        action={updateAppointmentAction}
        services={services}
        defaultValues={appointment}
        submitLabel="Save changes"
        error={error}
      />
    </>
  );
}
