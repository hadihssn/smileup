import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import {
  currentMonth,
  formatMonthLabel,
  getRevenueSummary,
  shiftMonth,
} from "@/lib/revenue";
import { formatDateLabel, formatPKR, formatTimeLabel } from "@/lib/format";
import { parsePage } from "@/lib/pagination";
import { PageHeader } from "../_components/PageHeader";
import { Pagination } from "../_components/Pagination";

export const dynamic = "force-dynamic";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; page?: string }>;
}) {
  const { month: requestedMonth, page: requestedPage } = await searchParams;
  const month = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth();
  const page = parsePage(requestedPage);
  const summary = await getRevenueSummary(month, page);

  const trendUp = summary.changePercent != null && summary.changePercent >= 0;

  return (
    <>
      <PageHeader
        title="Revenue"
        action={
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/revenue?month=${shiftMonth(month, -1)}`}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </Link>
            <span className="min-w-[130px] text-center text-sm font-medium text-slate-700">
              {formatMonthLabel(month)}
            </span>
            <Link
              href={`/admin/revenue?month=${shiftMonth(month, 1)}`}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Revenue this month
          </div>
          <div className="mt-1.5 text-3xl font-semibold text-slate-900">
            {formatPKR(summary.total)}
          </div>
          <div className="mt-1 text-[13px] text-slate-500">
            {summary.count} completed {summary.count === 1 ? "visit" : "visits"}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            vs {formatMonthLabel(summary.previousMonth)}
          </div>
          <div className="mt-1.5 text-3xl font-semibold text-slate-900">
            {formatPKR(summary.previousTotal)}
          </div>
          <div
            className={`mt-1 flex items-center gap-1 text-[13px] font-medium ${
              summary.changePercent == null ? "text-slate-500" : trendUp ? "text-brand-dark" : "text-red-600"
            }`}
          >
            {summary.changePercent == null ? (
              "No revenue last month to compare"
            ) : (
              <>
                {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(summary.changePercent).toFixed(1)}% {trendUp ? "up" : "down"}
              </>
            )}
          </div>
        </div>
      </div>

      {summary.missingChargeCount > 0 && (
        <div className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          {summary.missingChargeCount} completed{" "}
          {summary.missingChargeCount === 1 ? "visit is" : "visits are"} missing a charge amount
          this month — not counted in the total above.{" "}
          <Link href="/admin?view=all" className="font-semibold underline">
            Review appointments
          </Link>
        </div>
      )}

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-[12.5px] text-slate-500">
        <Lightbulb size={14} className="mt-0.5 shrink-0" />
        <span>
          Idea for later: this tracks revenue only (money collected). Adding expense tracking
          (supplies, rent, staff) would turn this into a real profit view.
        </span>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Completed visits this month
        </h3>
        {summary.appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No completed visits in this month yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {summary.appointments.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-[86px] shrink-0 text-[13px] font-medium text-slate-500">
                    {formatDateLabel(row.date)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{row.patientName}</div>
                    <div className="text-[13px] text-slate-500">
                      {formatTimeLabel(row.time)}
                      {row.serviceTitle && ` · ${row.serviceTitle}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {row.chargeAmount != null ? (
                    <div className="text-sm font-semibold text-slate-900">
                      {formatPKR(row.chargeAmount)}
                    </div>
                  ) : (
                    <Link
                      href={`/admin/appointments/${row.id}/edit`}
                      className="text-xs font-semibold text-amber-700 underline"
                    >
                      Add charge
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination
          page={summary.page}
          totalPages={summary.totalPages}
          buildHref={(p) => `/admin/revenue?month=${month}&page=${p}`}
        />
      </div>
    </>
  );
}
