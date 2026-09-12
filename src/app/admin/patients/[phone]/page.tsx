import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { redirect, notFound } from "next/navigation";
import { getPatientDetail } from "@/lib/patients";
import { formatDateLabel, formatPKR, formatTimeLabel } from "@/lib/format";
import { AdminHeader } from "../../_components/AdminHeader";
import { STATUS_STYLES } from "../../_components/statusStyles";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);
  const detail = await getPatientDetail(phone);
  if (!detail) notFound();

  const { summary, visits } = detail;

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <AdminHeader email={session.user.email} activeTab="patients" />

        <Link href="/admin/patients" className="mb-4 inline-block text-[13px] font-semibold text-muted hover:text-ink">
          ← All patients
        </Link>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">{summary.name}</h2>
              <p className="mt-1 text-[13.5px] text-muted">{summary.phone}</p>
            </div>
            {summary.isOverdueForRecall && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800">
                Overdue for recall
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.02em] text-muted uppercase">
                Visits
              </div>
              <div className="text-[15px] font-bold text-ink">{summary.totalCompletedVisits}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.02em] text-muted uppercase">
                First visit
              </div>
              <div className="text-[15px] font-bold text-ink">
                {summary.firstVisitDate ? formatDateLabel(summary.firstVisitDate) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.02em] text-muted uppercase">
                Last visit
              </div>
              <div className="text-[15px] font-bold text-ink">
                {summary.lastVisitDate ? formatDateLabel(summary.lastVisitDate) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.02em] text-muted uppercase">
                Lifetime revenue
              </div>
              <div className="text-[15px] font-bold text-ink">
                {formatPKR(summary.lifetimeRevenue)}
              </div>
            </div>
          </div>
        </div>

        <h3 className="mb-2 text-[13.5px] font-bold tracking-[0.02em] text-muted uppercase">
          Visit history
        </h3>
        <div className="flex flex-col gap-2">
          {visits.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-[92px] shrink-0 text-[13px] font-semibold text-muted">
                  {formatDateLabel(v.date)}
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold text-ink">
                    {formatTimeLabel(v.time)}
                    {v.isManualEntry && (
                      <span className="ml-1.5 text-[11px] font-medium text-muted">(manual)</span>
                    )}
                  </div>
                  <div className="text-[13px] text-muted">
                    {v.serviceTitle ?? "No specific service"}
                    {v.chargeAmount != null && ` · ${formatPKR(v.chargeAmount)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${STATUS_STYLES[v.status]}`}
                >
                  {v.status}
                </span>
                <a
                  href={`/admin/appointments/${v.id}/edit`}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-muted hover:bg-section"
                >
                  Edit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
