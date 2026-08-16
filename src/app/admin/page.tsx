import { auth } from "@/lib/auth/server";
import { signOutAction } from "./actions";

// Server Components reading session state must opt out of static
// rendering — the session depends on the request's cookies, so this page
// can't be cached at build time.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: session } = await auth.getSession();

  return (
    <main className="min-h-screen bg-section px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-ink">Admin dashboard</h1>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-line bg-white px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-section"
            >
              Sign out
            </button>
          </form>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <p className="text-[14.5px] text-muted">
            Signed in as <span className="font-semibold text-ink">{session?.user?.email}</span>.
          </p>
          <p className="mt-2 text-[13.5px] text-muted">
            The appointments list is coming next — this page just confirms
            sign-in and route protection are working end to end.
          </p>
        </div>
      </div>
    </main>
  );
}
