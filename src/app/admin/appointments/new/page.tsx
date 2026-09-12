import { getServices } from "@/lib/services";
import { createAppointmentAction } from "../../actions";
import { AppointmentForm } from "../../_components/AppointmentForm";
import { PageHeader } from "../../_components/PageHeader";

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="New appointment"
        subtitle="For walk-ins and phone bookings — this skips the online availability check, so double-check the time isn’t already taken."
      />
      <AppointmentForm
        action={createAppointmentAction}
        services={services}
        submitLabel="Create appointment"
        error={error}
      />
    </>
  );
}
