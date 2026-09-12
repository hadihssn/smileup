"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Wallet, Users, LogOut } from "lucide-react";
import { signOutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Appointments", icon: CalendarDays, match: (p: string) => p === "/admin" || p.startsWith("/admin/appointments") },
  { href: "/admin/revenue", label: "Revenue", icon: Wallet, match: (p: string) => p.startsWith("/admin/revenue") },
  { href: "/admin/patients", label: "Patients", icon: Users, match: (p: string) => p.startsWith("/admin/patients") },
];

// A persistent left sidebar rather than top tabs — the standard shape of
// a real admin tool (Stripe/Linear/Notion) rather than "a webpage with
// sections." Client Component because active-link highlighting needs the
// current pathname, which only client-side navigation hooks expose.
export function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
          S
        </div>
        <span className="text-[15px] font-semibold text-slate-900">SmileUp</span>
      </div>

      <nav className="flex-1 px-3 py-2">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-tint text-brand-dark"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-3 py-3">
        <div className="mb-2 truncate px-3 text-[12.5px] text-slate-500" title={email}>
          {email}
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
