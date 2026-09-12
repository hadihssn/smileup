import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getPatientsOverview } from "@/lib/patients";
import { getServices } from "@/lib/services";
import { currentMonth, formatMonthLabel } from "@/lib/revenue";
import { formatDateLabel, formatPKR } from "@/lib/format";
import { AdminHeader } from "../_components/AdminHeader";

export const dynamic = "force-dynamic";

type PatientFilter = "all" | "overdue";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; service?: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { filter: requestedFilter, q, service: serviceId } = await searchParams;
  const filter: PatientFilter = requestedFilter === "overdue" ? "overdue" : "all";
  const query = q?.trim() ?? "";

  const month = currentMonth();
  const [{ patients, stats }, allServices] = await Promise.all([
    getPatientsOverview(month),
    getServices(),
  ]);

  let visible = filter === "overdue" ? patients.filter((p) => p.isOverdueForRecall) : patients;
  if (query) {
    const q2 = query.toLowerCase();
    visible = visible.filter(
      (p) => p.name.toLowerCase().includes(q2) || p.phone.toLowerCase().includes(q2),
    );
  }
  if (serviceId) {
    visible = visible.filter((p) => p.serviceIdsReceived.includes(serviceId));
  }
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

        <div className="mb-4 flex gap-2">
          <Link
            href={`/admin/patients?${new URLSearchParams({ filter: "all", ...(query && { q: query }), ...(serviceId && { service: serviceId }) })}`}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              filter === "all"
                ? "bg-brand text-white"
                : "border border-line bg-white text-ink hover:bg-brand-tint"
            }`}
          >
            All ({patients.length})
          </Link>
          <Link
            href={`/admin/patients?${new URLSearchParams({ filter: "overdue", ...(query && { q: query }), ...(serviceId && { service: serviceId }) })}`}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              filter === "overdue"
                ? "bg-brand text-white"
                : "border border-line bg-white text-ink hover:bg-brand-tint"
            }`}
          >
            Overdue for recall ({overdueCount})
          </Link>
        </div>

        <form className="mb-6 flex flex-wrap gap-2" action="/admin/patients">
          <input type="hidden" name="filter" value={filter} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or phone…"
            className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3.5 py-2.5 font-[inherit] text-[13.5px]"
          />
          <select
            name="service"
            defaultValue={serviceId ?? ""}
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 font-[inherit] text-[13.5px]"
          >
            <option value="">All services</option>
            {allServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-dark"
          >
            Search
          </button>
          {(query || serviceId) && (
            <Link
              href={`/admin/patients?filter=${filter}`}
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:bg-section"
            >
              Clear
            </Link>
          )}
        </form>

        {filter === "overdue" && overdueCount > 0 && (
          <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            These patients had a completed visit 6+ months ago and don&rsquo;t have anything
            booked — good candidates for a recall call or message.
          </div>
        )}

        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <p className="text-[14.5px] text-muted">
              {query || serviceId
                ? "No patients match that search."
                : filter === "overdue"
                  ? "No one is overdue for a recall right now."
                  : "No patients yet."}
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
