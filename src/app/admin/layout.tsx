import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AdminSidebar } from "./_components/AdminSidebar";

// Every /admin/* page used to fetch its own session and render its own
// copy of the header/nav (see docs/notes/27's AdminHeader extraction).
// A layout is the correct place for this in the App Router: it wraps
// every nested page automatically, so the auth check and the sidebar
// shell exist exactly once, not once per page. src/proxy.ts already
// blocks unauthenticated requests at the edge (docs/notes/21) — this is
// a second, redundant check, same defense-in-depth reasoning as the
// mutating Server Actions in docs/notes/23.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar email={session.user.email} />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-4xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
