import Link from "next/link";
import { Plus, CalendarOff, Check, X, Pencil } from "lucide-react";
import { updateAppointmentStatusAction, blockDateAction, unblockDateAction } from "./actions";
import { getAppointments, type AppointmentView, type AppointmentRow } from "@/lib/appointments";
import { getBlockedDates } from "@/lib/blockedDates";
import { parsePage } from "@/lib/pagination";
import { formatDateLabel, formatTimeLabel, formatPKR } from "@/lib/format";
import { STATUS_STYLES } from "./_components/statusStyles";
import { PageHeader } from "./_components/PageHeader";
import { Pagination } from "./_components/Pagination";

export const dynamic = "force-dynamic";

const VIEWS: { value: AppointmentView; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All" },
];

function groupByDate(rows: AppointmentRow[]): [string, AppointmentRow[]][] {
  const groups = new Map<string, AppointmentRow[]>();
  for (const row of rows) {
    const bucket = groups.get(row.date) ?? [];
    bucket.push(row);
    groups.set(row.date, bucket);
  }
  return [...groups.entries()];
}

function AppointmentActions({ row }: { row: AppointmentRow }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {row.status === "pending" && (
        <form action={updateAppointmentStatusAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="status" value="confirmed" />
          <button
            type="submit"
            title="Confirm"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white hover:bg-brand-dark"
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
        </form>
      )}
      {row.status !== "cancelled" && (
        <form action={updateAppointmentStatusAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="status" value="cancelled" />
          <button
            type="submit"
            title="Cancel"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </form>
      )}
      <Link
        href={`/admin/appointments/${row.id}/edit`}
        title="Edit"
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <Pencil size={13} strokeWidth={2.25} />
      </Link>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const { view: requestedView, page: requestedPage } = await searchParams;
  const view: AppointmentView =
    requestedView === "today" || requestedView === "upcoming" || requestedView === "all"
      ? requestedView
      : "upcoming";
  const page = parsePage(requestedPage);

  const [{ rows, totalPages }, blocked] = await Promise.all([
    getAppointments(view, page),
    getBlockedDates(),
  ]);
  const groups = groupByDate(rows);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingBlocked = blocked.filter((b) => b.date >= today);

  return (
    <>
      <PageHeader
        title="Appointments"
        action={
          <Link
            href="/admin/appointments/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <Plus size={15} strokeWidth={2.5} />
            New appointment
          </Link>
        }
      />

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        {VIEWS.map((v) => (
          <Link
            key={v.value}
            href={`/admin?view=${v.value}`}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              v.value === view ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            No {view === "today" ? "appointments today" : view === "upcoming" ? "upcoming appointments" : "appointments yet"}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(([date, dayRows]) => (
            <div key={date}>
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {formatDateLabel(date)}
              </h2>
              <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {dayRows.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-[68px] shrink-0 text-sm font-medium text-slate-700">
                        {formatTimeLabel(row.time)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {row.patientName}
                          {row.isManualEntry && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">(manual)</span>
                          )}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {row.patientPhone}
                          {row.serviceTitle && ` · ${row.serviceTitle}`}
                          {row.chargeAmount != null && ` · ${formatPKR(row.chargeAmount)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                      <AppointmentActions row={row} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={(p) => `/admin?view=${view}&page=${p}`} />

      <div className="mt-8">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <CalendarOff size={13} />
          Blocked dates
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <form action={blockDateAction} className="mb-4 flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                name="date"
                required
                min={today}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 font-[inherit] text-sm text-slate-900"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Reason (optional)</label>
              <input
                type="text"
                name="reason"
                placeholder="e.g. Public holiday"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-[inherit] text-sm text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Block
            </button>
          </form>

          {upcomingBlocked.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming blocked dates.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcomingBlocked.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                >
                  <div className="text-sm text-slate-900">
                    <span className="font-medium">{formatDateLabel(b.date)}</span>
                    {b.reason && <span className="text-slate-500"> — {b.reason}</span>}
                  </div>
                  <form action={unblockDateAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="text-xs font-medium text-slate-500 hover:text-slate-800">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
