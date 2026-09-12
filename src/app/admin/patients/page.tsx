import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getPatientsOverview } from "@/lib/patients";
import { currentMonth, formatMonthLabel } from "@/lib/revenue";
import { formatDateLabel, formatPKR } from "@/lib/format";
import { AdminHeader } from "../_components/AdminHeader";

export const dynamic = "force-dynamic";

type PatientFilter = "all" | "overdue";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { filter: requestedFilter } = await searchParams;
  const filter: PatientFilter = requestedFilter === "overdue" ? "overdue" : "all";

  const month = currentMonth();
  const { patients, stats } = await getPatientsOverview(month);
  const visible = filter === "overdue" ? patients.filter((p) => p.isOverdueForRecall) : patients;
  const overdueCount = patients.filter((p) => p.isOverdueForRecall).length;

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminHeader email={session.user.email} activeTab="patients" />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-[12px] font-semibold tracking-[0.02em] text-muted uppercase">
              Total patients
            </div>
            <div className="mt-1 font-heading text-3xl font-bold text-ink">
              {stats.totalPatients}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-[12px] font-semibold tracking-[0.02em] text-muted uppercase">
              New this month
            </div>
            <div className="mt-1 font-heading text-3xl font-bold text-ink">
              {stats.newThisMonth}
            </div>
            <div className="mt-1 text-[12px] text-muted">{formatMonthLabel(month)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-[12px] font-semibold tracking-[0.02em] text-muted uppercase">
              Returning this month
            </div>
            <div className="mt-1 font-heading text-3xl font-bold text-ink">
              {stats.returningThisMonth}
            </div>
            <div className="mt-1 text-[12px] text-muted">{formatMonthLabel(month)}</div>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Link
            href="/admin/patients?filter=all"
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              filter === "all"
                ? "bg-brand text-white"
                : "border border-line bg-white text-ink hover:bg-brand-tint"
            }`}
          >
            All ({patients.length})
          </Link>
          <Link
            href="/admin/patients?filter=overdue"
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              filter === "overdue"
                ? "bg-brand text-white"
                : "border border-line bg-white text-ink hover:bg-brand-tint"
            }`}
          >
            Overdue for recall ({overdueCount})
          </Link>
        </div>

        {filter === "overdue" && overdueCount > 0 && (
          <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            These patients had a completed visit 6+ months ago and don&rsquo;t have anything
            booked — good candidates for a recall call or message.
          </div>
        )}

        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <p className="text-[14.5px] text-muted">
              {filter === "overdue" ? "No one is overdue for a recall right now." : "No patients yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((p) => (
              <Link
                key={p.phone}
                href={`/admin/patients/${encodeURIComponent(p.phone)}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:bg-section/60"
              >
                <div>
                  <div className="text-[14.5px] font-semibold text-ink">
                    {p.name}
                    {p.isOverdueForRecall && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Overdue for recall
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-muted">
                    {p.phone} · {p.totalCompletedVisits}{" "}
                    {p.totalCompletedVisits === 1 ? "visit" : "visits"}
                    {p.lastTreatment && ` · last: ${p.lastTreatment}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] text-muted">
                    {p.lastVisitDate ? formatDateLabel(p.lastVisitDate) : "No visits yet"}
                  </div>
                  {p.lifetimeRevenue > 0 && (
                    <div className="text-[13.5px] font-semibold text-ink">
                      {formatPKR(p.lifetimeRevenue)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
