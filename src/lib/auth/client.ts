"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// Client-side auth operations (sign-in form submission, session hooks).
// Separate from src/lib/auth/server.ts — that instance holds the cookie
// secret and can only run on the server; this one is safe to bundle into
// client code.
export const authClient = createAuthClient();
