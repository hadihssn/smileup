import Link from "next/link";
import { Search, Clock } from "lucide-react";
import { getPatientsOverview } from "@/lib/patients";
import { getServices } from "@/lib/services";
import { currentMonth, formatMonthLabel } from "@/lib/revenue";
import { formatDateLabel, formatPKR } from "@/lib/format";
import { PageHeader } from "../_components/PageHeader";

export const dynamic = "force-dynamic";

type PatientFilter = "all" | "overdue";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; service?: string }>;
}) {
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
    <>
      <PageHeader title="Patients" />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Total patients
          </div>
          <div className="mt-1.5 text-3xl font-semibold text-slate-900">{stats.totalPatients}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            New this month
          </div>
          <div className="mt-1.5 text-3xl font-semibold text-slate-900">{stats.newThisMonth}</div>
          <div className="mt-1 text-[13px] text-slate-500">{formatMonthLabel(month)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Returning this month
          </div>
          <div className="mt-1.5 text-3xl font-semibold text-slate-900">
            {stats.returningThisMonth}
          </div>
          <div className="mt-1 text-[13px] text-slate-500">{formatMonthLabel(month)}</div>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        <Link
          href={`/admin/patients?${new URLSearchParams({ filter: "all", ...(query && { q: query }), ...(serviceId && { service: serviceId }) })}`}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          All ({patients.length})
        </Link>
        <Link
          href={`/admin/patients?${new URLSearchParams({ filter: "overdue", ...(query && { q: query }), ...(serviceId && { service: serviceId }) })}`}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            filter === "overdue" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Overdue for recall ({overdueCount})
        </Link>
      </div>

      <form className="mb-5 flex flex-wrap gap-2" action="/admin/patients">
        <input type="hidden" name="filter" value={filter} />
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or phone…"
            className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 font-[inherit] text-sm text-slate-900"
          />
        </div>
        <select
          name="service"
          defaultValue={serviceId ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-[inherit] text-sm text-slate-900"
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
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Search
        </button>
        {(query || serviceId) && (
          <Link
            href={`/admin/patients?filter=${filter}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      {filter === "overdue" && overdueCount > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          <Clock size={14} className="mt-0.5 shrink-0" />
          <span>
            These patients had a completed visit 6+ months ago and don&rsquo;t have anything
            booked — good candidates for a recall call or message.
          </span>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            {query || serviceId
              ? "No patients match that search."
              : filter === "overdue"
                ? "No one is overdue for a recall right now."
                : "No patients yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {visible.map((p) => (
            <Link
              key={p.phone}
              href={`/admin/patients/${encodeURIComponent(p.phone)}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {p.name}
                  {p.isOverdueForRecall && (
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                      Overdue for recall
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-slate-500">
                  {p.phone} · {p.totalCompletedVisits}{" "}
                  {p.totalCompletedVisits === 1 ? "visit" : "visits"}
                  {p.lastTreatment && ` · last: ${p.lastTreatment}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-slate-500">
                  {p.lastVisitDate ? formatDateLabel(p.lastVisitDate) : "No visits yet"}
                </div>
                {p.lifetimeRevenue > 0 && (
                  <div className="text-sm font-semibold text-slate-900">
                    {formatPKR(p.lifetimeRevenue)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
