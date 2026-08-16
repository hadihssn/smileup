import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getServices } from "@/lib/services";
import { createAppointmentAction } from "../../actions";
import { AppointmentForm } from "../../_components/AppointmentForm";

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { error } = await searchParams;
  const services = await getServices();

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-heading text-2xl font-bold text-ink">New appointment</h1>
        <p className="mb-6 text-[13.5px] text-muted">
          For walk-ins and phone bookings — this skips the online availability
          check, so double-check the time isn&rsquo;t already taken.
        </p>
        <AppointmentForm
          action={createAppointmentAction}
          services={services}
          submitLabel="Create appointment"
          error={error}
        />
      </div>
    </main>
  );
}
