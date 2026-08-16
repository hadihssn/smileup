import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { signOutAction } from "../actions";
import {
  currentMonth,
  formatMonthLabel,
  getRevenueSummary,
  shiftMonth,
} from "@/lib/revenue";
import { formatDateLabel, formatPKR, formatTimeLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { month: requestedMonth } = await searchParams;
  const month = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth();
  const summary = await getRevenueSummary(month);

  const trendUp = summary.changePercent != null && summary.changePercent >= 0;

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Admin dashboard</h1>
            <p className="mt-1 text-[13px] text-muted">
              Signed in as <span className="font-semibold">{session.user.email}</span>
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-white/70"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mb-6 flex gap-4 border-b border-line text-[13.5px] font-semibold">
          <Link href="/admin" className="px-1 pb-2 text-muted hover:text-ink">
            Appointments
          </Link>
          <span className="border-b-2 border-brand px-1 pb-2 text-brand-dark">Revenue</span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/admin/revenue?month=${shiftMonth(month, -1)}`}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-section"
          >
            ← Prev
          </Link>
          <h2 className="text-[15px] font-bold text-ink">{formatMonthLabel(month)}</h2>
          <Link
            href={`/admin/revenue?month=${shiftMonth(month, 1)}`}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink hover:bg-section"
          >
            Next →
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-[12px] font-semibold tracking-[0.02em] text-muted uppercase">
              Revenue this month
            </div>
            <div className="mt-1 font-heading text-3xl font-bold text-ink">
              {formatPKR(summary.total)}
            </div>
            <div className="mt-1 text-[13px] text-muted">
              {summary.count} completed {summary.count === 1 ? "visit" : "visits"}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-[12px] font-semibold tracking-[0.02em] text-muted uppercase">
              vs {formatMonthLabel(summary.previousMonth)}
            </div>
            <div className="mt-1 font-heading text-3xl font-bold text-ink">
              {formatPKR(summary.previousTotal)}
            </div>
            <div
              className={`mt-1 text-[13px] font-semibold ${
                summary.changePercent == null
                  ? "text-muted"
                  : trendUp
                    ? "text-brand-dark"
                    : "text-red-600"
              }`}
            >
              {summary.changePercent == null
                ? "No revenue last month to compare"
                : `${trendUp ? "▲" : "▼"} ${Math.abs(summary.changePercent).toFixed(1)}% ${trendUp ? "up" : "down"}`}
            </div>
          </div>
        </div>

        {summary.missingChargeCount > 0 && (
          <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            {summary.missingChargeCount} completed{" "}
            {summary.missingChargeCount === 1 ? "visit is" : "visits are"} missing a charge
            amount this month — not counted in the total above.{" "}
            <Link href="/admin?view=all" className="font-semibold underline">
              Review appointments
            </Link>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-dashed border-line bg-white/60 px-4 py-3 text-[12.5px] text-muted">
          💡 Idea for later: this tracks revenue only (money collected).
          Adding expense tracking (supplies, rent, staff) would turn this
          into a real profit view — worth raising with the dentist, not
          built yet.
        </div>

        <div>
          <h3 className="mb-2 text-[13.5px] font-bold tracking-[0.02em] text-muted uppercase">
            Completed visits this month
          </h3>
          {summary.appointments.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <p className="text-[14.5px] text-muted">No completed visits in this month yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {summary.appointments.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[92px] shrink-0 text-[13px] font-semibold text-muted">
                      {formatDateLabel(row.date)}
                    </div>
                    <div>
                      <div className="text-[14.5px] font-semibold text-ink">
                        {row.patientName}
                      </div>
                      <div className="text-[13px] text-muted">
                        {formatTimeLabel(row.time)}
                        {row.serviceTitle && ` · ${row.serviceTitle}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {row.chargeAmount != null ? (
                      <div className="text-[14.5px] font-semibold text-ink">
                        {formatPKR(row.chargeAmount)}
                      </div>
                    ) : (
                      <a
                        href={`/admin/appointments/${row.id}/edit`}
                        className="text-[12.5px] font-semibold text-amber-700 underline"
                      >
                        Add charge
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
