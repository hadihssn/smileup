# 19 — Correcting the auth choice: Stack Auth → Managed Better Auth

**Commit:** `fix: swap Stack Auth for Neon's current Managed Better Auth`
**Files:** `package.json`, `.env.example`

## What happened

[17](17-database-and-auth-scaffolding.md) installed `@stackframe/stack`
and assumed "Neon Auth" meant Stack Auth wired into Neon's console, based
on how that product used to work. When it came time to actually locate
the keys in the Neon dashboard, they didn't exist — because Neon has
since replaced that integration with a different product, **Managed
Better Auth** (built on the open-source Better Auth project, package
`@neondatabase/auth`), which has a completely different setup: no
project ID / publishable key / secret key trio, just an Auth URL from the
console plus a self-generated cookie secret.

## Why this is exactly the trap `AGENTS.md` warns about

This project's own root-level `AGENTS.md`/`CLAUDE.md` already flags that
this repo pins dependency versions newer than typical model training
data, and to check real docs instead of assuming. This is that exact
failure mode, just for a different dependency (Neon's auth product, not
Next.js itself) — an assumption based on how a fast-moving product used
to work turned out to be stale by the time it mattered. The fix was the
same prescribed remedy: go check the actual current docs
(`neon.com/docs/auth`) rather than continuing to guess, once the
mismatch surfaced.

## What changed

- `@stackframe/stack` removed, `@neondatabase/auth` installed instead
  (currently in Beta on Neon's side — worth knowing if anything about
  auth feels unstable later).
- Env vars are now just two: `NEON_AUTH_BASE_URL` (from Console → Project
  → Branch → Auth → Enable Auth → Configuration tab) and
  `NEON_AUTH_COOKIE_SECRET` (generated locally, not from the dashboard —
  `openssl rand -base64 32`).
- `.env.example` updated to match.

The actual admin-login integration code hasn't been written yet (that's
still task #5) — this commit only corrects the dependency and env var
scaffolding before that code gets built on top of it, so it's built
against what's actually current rather than what's assumed.
