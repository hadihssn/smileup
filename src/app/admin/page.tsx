import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { signOutAction, updateAppointmentStatusAction, blockDateAction, unblockDateAction } from "./actions";
import { getAppointments, type AppointmentView, type AppointmentRow } from "@/lib/appointments";
import { getBlockedDates } from "@/lib/blockedDates";
import { formatDateLabel, formatTimeLabel, formatPKR } from "@/lib/format";

// Server Components reading session state must opt out of static
// rendering — the session depends on the request's cookies, so this page
// can't be cached at build time.
export const dynamic = "force-dynamic";

const VIEWS: { value: AppointmentView; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All" },
];

const STATUS_STYLES: Record<AppointmentRow["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-tint text-brand-dark",
  completed: "bg-sky-100 text-sky-800",
  cancelled: "bg-line text-muted line-through",
};

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
    <div className="flex shrink-0 gap-1.5">
      {row.status === "pending" && (
        <form action={updateAppointmentStatusAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="status" value="confirmed" />
          <button
            type="submit"
            className="rounded-lg bg-brand px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-dark"
          >
            Confirm
          </button>
        </form>
      )}
      {row.status !== "cancelled" && (
        <form action={updateAppointmentStatusAction}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="status" value="cancelled" />
          <button
            type="submit"
            className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-muted hover:bg-section"
          >
            Cancel
          </button>
        </form>
      )}
      <a
        href={`/admin/appointments/${row.id}/edit`}
        className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-muted hover:bg-section"
      >
        Edit
      </a>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { data: session } = await auth.getSession();
  const requestedView = (await searchParams).view;
  const view: AppointmentView =
    requestedView === "today" || requestedView === "upcoming" || requestedView === "all"
      ? requestedView
      : "upcoming";

  const [rows, blocked] = await Promise.all([getAppointments(view), getBlockedDates()]);
  const groups = groupByDate(rows);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingBlocked = blocked.filter((b) => b.date >= today);

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Admin dashboard</h1>
            <p className="mt-1 text-[13px] text-muted">
              Signed in as <span className="font-semibold">{session?.user?.email}</span>
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
          <span className="border-b-2 border-brand px-1 pb-2 text-brand-dark">Appointments</span>
          <Link href="/admin/revenue" className="px-1 pb-2 text-muted hover:text-ink">
            Revenue
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {VIEWS.map((v) => (
              <Link
                key={v.value}
                href={`/admin?view=${v.value}`}
                className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                  v.value === view
                    ? "bg-brand text-white"
                    : "border border-line bg-white text-ink hover:bg-brand-tint"
                }`}
              >
                {v.label}
              </Link>
            ))}
          </div>
          <a
            href="/admin/appointments/new"
            className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-ink/85"
          >
            + New appointment
          </a>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <p className="text-[14.5px] text-muted">
              No {view === "today" ? "appointments today" : view === "upcoming" ? "upcoming appointments" : "appointments yet"}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(([date, dayRows]) => (
              <div key={date}>
                <h2 className="mb-2 text-[13.5px] font-bold tracking-[0.02em] text-muted uppercase">
                  {formatDateLabel(date)}
                </h2>
                <div className="flex flex-col gap-2">
                  {dayRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[72px] shrink-0 text-[13.5px] font-semibold text-ink">
                          {formatTimeLabel(row.time)}
                        </div>
                        <div>
                          <div className="text-[14.5px] font-semibold text-ink">
                            {row.patientName}
                            {row.isManualEntry && (
                              <span className="ml-1.5 text-[11px] font-medium text-muted">
                                (manual)
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-muted">
                            {row.patientPhone}
                            {row.serviceTitle && ` · ${row.serviceTitle}`}
                            {row.chargeAmount != null && ` · ${formatPKR(row.chargeAmount)}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${STATUS_STYLES[row.status]}`}
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

        <div className="mt-10">
          <h2 className="mb-2 text-[13.5px] font-bold tracking-[0.02em] text-muted uppercase">
            Blocked dates
          </h2>
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <form action={blockDateAction} className="mb-4 flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-ink">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  min={today}
                  className="rounded-lg border border-line px-2.5 py-2 font-[inherit] text-[13.5px]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[12px] font-semibold text-ink">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Public holiday"
                  className="w-full rounded-lg border border-line px-2.5 py-2 font-[inherit] text-[13.5px]"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-brand-dark"
              >
                Block
              </button>
            </form>

            {upcomingBlocked.length === 0 ? (
              <p className="text-[13px] text-muted">No upcoming blocked dates.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {upcomingBlocked.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
                  >
                    <div className="text-[13.5px] text-ink">
                      <span className="font-semibold">{formatDateLabel(b.date)}</span>
                      {b.reason && <span className="text-muted"> — {b.reason}</span>}
                    </div>
                    <form action={unblockDateAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="text-[12px] font-semibold text-muted hover:text-ink"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
