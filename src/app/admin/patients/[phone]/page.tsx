import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getPatientDetail } from "@/lib/patients";
import { formatDateLabel, formatPKR, formatTimeLabel } from "@/lib/format";
import { STATUS_STYLES } from "../../_components/statusStyles";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);
  const detail = await getPatientDetail(phone);
  if (!detail) notFound();

  const { summary, visits } = detail;

  return (
    <>
      <Link
        href="/admin/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        All patients
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{summary.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{summary.phone}</p>
          </div>
          {summary.isOverdueForRecall && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
              Overdue for recall
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-4">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Visits
            </div>
            <div className="text-[15px] font-semibold text-slate-900">
              {summary.totalCompletedVisits}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              First visit
            </div>
            <div className="text-[15px] font-semibold text-slate-900">
              {summary.firstVisitDate ? formatDateLabel(summary.firstVisitDate) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Last visit
            </div>
            <div className="text-[15px] font-semibold text-slate-900">
              {summary.lastVisitDate ? formatDateLabel(summary.lastVisitDate) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Lifetime revenue
            </div>
            <div className="text-[15px] font-semibold text-slate-900">
              {formatPKR(summary.lifetimeRevenue)}
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Visit history
      </h3>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {visits.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="w-[86px] shrink-0 text-[13px] font-medium text-slate-500">
                {formatDateLabel(v.date)}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {formatTimeLabel(v.time)}
                  {v.isManualEntry && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">(manual)</span>
                  )}
                </div>
                <div className="text-[13px] text-slate-500">
                  {v.serviceTitle ?? "No specific service"}
                  {v.chargeAmount != null && ` · ${formatPKR(v.chargeAmount)}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[v.status]}`}
              >
                {v.status}
              </span>
              <Link
                href={`/admin/appointments/${v.id}/edit`}
                title="Edit"
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil size={13} strokeWidth={2.25} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
