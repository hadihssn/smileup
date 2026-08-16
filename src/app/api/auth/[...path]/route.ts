import { auth } from "@/lib/auth/server";

// Every Managed Better Auth request (sign-in, session refresh, sign-out,
// etc.) from the client is proxied through this one catch-all route.
export const { GET, POST } = auth.handler();
