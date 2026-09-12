import Link from "next/link";
import { signOutAction } from "../actions";

export type AdminTab = "appointments" | "revenue" | "patients";

const TABS: { value: AdminTab; label: string; href: string }[] = [
  { value: "appointments", label: "Appointments", href: "/admin" },
  { value: "revenue", label: "Revenue", href: "/admin/revenue" },
  { value: "patients", label: "Patients", href: "/admin/patients" },
];

// Shared by every /admin/* page — previously each page duplicated the
// same title/sign-out/tab-nav markup (see docs/notes/22, /26), which was
// fine at two pages but would mean a third copy quietly drifting the
// moment one page's nav changed and the others didn't.
export function AdminHeader({ email, activeTab }: { email?: string; activeTab: AdminTab }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Admin dashboard</h1>
          <p className="mt-1 text-[13px] text-muted">
            Signed in as <span className="font-semibold">{email}</span>
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
        {TABS.map((tab) =>
          tab.value === activeTab ? (
            <span key={tab.value} className="border-b-2 border-brand px-1 pb-2 text-brand-dark">
              {tab.label}
            </span>
          ) : (
            <Link key={tab.value} href={tab.href} className="px-1 pb-2 text-muted hover:text-ink">
              {tab.label}
            </Link>
          ),
        )}
      </div>
    </>
  );
}
