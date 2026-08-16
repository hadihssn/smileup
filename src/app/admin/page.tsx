import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { signOutAction } from "./actions";
import { getAppointments, type AppointmentView, type AppointmentRow } from "@/lib/appointments";
import { formatDateLabel, formatTimeLabel } from "@/lib/format";

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

  const rows = await getAppointments(view);
  const groups = groupByDate(rows);

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
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

        <div className="mb-6 flex gap-2">
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
                      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[72px] shrink-0 text-[13.5px] font-semibold text-ink">
                          {formatTimeLabel(row.time)}
                        </div>
                        <div>
                          <div className="text-[14.5px] font-semibold text-ink">
                            {row.patientName}
                          </div>
                          <div className="text-[13px] text-muted">
                            {row.patientPhone}
                            {row.serviceTitle && ` · ${row.serviceTitle}`}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
