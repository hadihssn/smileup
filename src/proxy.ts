import { auth } from "@/lib/auth/server";

// `proxy.ts` is Next.js 16's replacement for `middleware.ts` (same
// mechanism, new name) — this is what actually protects /admin/*. An
// unauthenticated request to any matched route gets redirected to
// /auth/sign-in before the page ever renders.
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/admin/:path*"],
};
