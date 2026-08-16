import { createNeonAuth } from "@neondatabase/auth/next/server";

if (!process.env.NEON_AUTH_BASE_URL) {
  throw new Error("NEON_AUTH_BASE_URL is not set — see .env.example.");
}
if (!process.env.NEON_AUTH_COOKIE_SECRET) {
  throw new Error("NEON_AUTH_COOKIE_SECRET is not set — see .env.example.");
}

// Single unified auth instance: provides .handler() for the API route,
// .middleware() for route protection, and the same server methods
// (auth.signIn.email(), auth.getSession(), etc.) used directly in Server
// Actions and Server Components elsewhere in the app.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET,
  },
});
