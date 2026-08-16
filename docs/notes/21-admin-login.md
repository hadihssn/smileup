# 21 — Admin login with Neon Managed Better Auth

**Commit:** `feat: add admin login with Neon Managed Better Auth`
**Files:** `src/lib/auth/server.ts`, `src/lib/auth/client.ts`,
`src/app/api/auth/[...path]/route.ts`, `src/proxy.ts`,
`src/app/auth/sign-in/`, `src/app/admin/`, `scripts/create-admin.ts`

## What this was

The first authenticated route in the app: `/admin` is now real,
protected, and only reachable by signing in with a real account — nothing
in it is fake or mocked. This note focuses more than usual on things that
went wrong along the way, because each one is a genuinely useful lesson,
not just a fix.

## The five pieces, and what each does

- **`src/lib/auth/server.ts`** — the one `auth` instance, built with
  `createNeonAuth()`. Everything server-side goes through this: session
  reads, sign-in/out calls, the API handler, the middleware.
- **`src/lib/auth/client.ts`** — a separate, `"use client"` instance for
  browser-side auth calls. Kept apart from the server one deliberately:
  the server instance is configured with the cookie secret, which must
  never end up in a client bundle.
- **`src/app/api/auth/[...path]/route.ts`** — a catch-all API route.
  Every auth operation (sign-in, sign-up, sign-out, session refresh) goes
  through this one file as `POST`/`GET` requests to `/api/auth/*`.
- **`src/proxy.ts`** — Next.js 16's replacement for `middleware.ts` (same
  mechanism, renamed). This is what actually blocks unauthenticated
  requests to `/admin/*`, redirecting to `/auth/sign-in` before the page
  ever renders.
- **`src/app/auth/sign-in/`** and **`src/app/admin/`** — the sign-in form
  (Server Action `signInWithEmail`) and a minimal admin page proving the
  whole loop works (session display + sign-out). The real dashboard
  content is next (task #6) — this page exists to verify auth in
  isolation first, same reasoning as [17](17-database-and-auth-scaffolding.md)
  shipping schema plumbing before real tables.

## No public sign-up page — on purpose

There's exactly one admin account, for one person (the dentist). A public
`/auth/sign-up` page would be actively wrong here — it would let anyone
who finds the URL create an account with unknown privileges. Instead,
`scripts/create-admin.ts` is the *only* way an account gets created, run
manually, once, by whoever's setting up the app.

## Bug #1: the auth SDK can't run outside a real HTTP request

The first version of `create-admin.ts` imported the same `auth` instance
used everywhere else and called `auth.signUp.email()` directly as a
standalone Node script. It failed:

```
Error: `cookies` was called outside a request scope.
```

`@neondatabase/auth`'s Next.js integration reads/writes cookies via
`next/headers`, which only works *inside* an active Next.js request —
a Server Component, Server Action, Route Handler, or middleware. A plain
`tsx scripts/create-admin.ts` invocation has none of that; there's no
request to attach cookies to.

The fix: run the actual dev server and have the script hit the real
`/api/auth/sign-up/email` endpoint over HTTP instead of importing the
auth instance directly. That endpoint runs inside a genuine Next.js
request (the Route Handler), so it has the request context the SDK
needs. This is a real constraint of how the SDK works, not a workaround
to avoid — any future admin-provisioning tooling needs to go through the
running app the same way, not call `auth.*` from a bare script.

## Bug #2: `proxy.ts` in the wrong directory did nothing — silently

This was the serious one. The first version of `proxy.ts` sat at the true
repository root (next to `package.json`), matching the docs' example
verbatim. It compiled fine, `tsc` and `eslint` were both clean, and
nothing errored — but `/admin` was fully reachable with **no
authentication at all**. curl confirmed a request with no session cookie
got a `200` with the real dashboard content rendered.

The cause: this project uses a `src/` layout (`src/app`, not a top-level
`app/`). Next.js's convention for root-level special files — including
`middleware.ts`/`proxy.ts` — is that they must live *inside* `src/` when
a `src/` directory is in use, not at the true repo root. Moving the file
to `src/proxy.ts` fixed it immediately; a request to `/admin` without a
session then correctly got a `307` redirect to `/auth/sign-in`.

**Why this matters more than a normal bug:** this wasn't a crash or a
type error — it was silent. The page rendered *successfully*, just
without the security check that was supposed to gate it. Nothing in the
type system or linter catches "this middleware file is in the wrong
place and is therefore never loaded." The only way this surfaced was by
actually testing the unauthenticated case against a real running server
— curling `/admin` with no cookies and checking the status code — rather
than trusting that "the code compiles and the page looks right when I'm
logged in." This is the same principle as
[16](16-browser-verification-and-mobile-fix.md)'s browser-verification
pass, sharpened: for anything security-relevant, the thing to verify
isn't just "does the happy path work," it's "does the *unhappy* path
correctly fail."

## What was actually verified (not just assumed)

Every step below was checked against the real Neon Auth backend and a
real running server, not inferred from reading the code:

1. `POST /api/auth/sign-up/email` → created the real admin account.
2. `GET /admin` with no session cookie → `307` redirect to `/auth/sign-in`.
3. `POST /api/auth/sign-in/email` with correct credentials → `200`,
   session cookie issued.
4. `GET /admin` with that session cookie → `200`, real dashboard HTML
   showing the actual signed-in email.
5. `POST /api/auth/sign-out` → session revoked; `GET /admin` afterward
   → back to `307` redirect.
6. The same flow again through the actual browser UI (typing into the
   real form, clicking the real button) — not just the API directly —
   confirming the Server Action wiring (`signInWithEmail`,
   `signOutAction`) works end to end, not just the underlying endpoints.

## A placeholder credential, not a real one

The admin account uses a placeholder email (`admin@smileup.clinic`) and a
randomly generated password, per the user's own instruction to use a
placeholder "for now." This needs to be replaced with Dr. Aftab's real
email before real launch — flagged here the same way the contact info
and stock photography are flagged as placeholder in
[PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md).
