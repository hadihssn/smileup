# 17 — Scaffolding a real backend: Neon Postgres + Drizzle + Stack Auth

**Commit:** `chore: scaffold Neon Postgres, Drizzle ORM, and Stack Auth`
**Files:** `package.json`, `drizzle.config.ts`, `src/db/index.ts`,
`src/db/schema.ts`, `.env.example`

## What this was

The start of Phase 1 of the real product idea behind this site: turning
the booking form and an admin dashboard from static/local-state mockups
into a system backed by a real database. This commit is just the
plumbing — no actual tables or features yet — so it's worth understanding
each piece on its own before the next commits build on top of it.

## The pieces, and why each one

**Neon (`@neondatabase/serverless`)** — a hosted Postgres provider with a
generous free tier and no local database server to install/maintain. The
`serverless` package matters specifically: Neon offers both a normal
Postgres wire-protocol connection and this HTTP-based driver. The HTTP
driver is what lets database queries run from serverless/edge functions
(like a Next.js API route or Server Action on Vercel) without keeping a
persistent TCP connection open — a normal `pg` client would exhaust
connection limits fast in that environment.

**Drizzle ORM (`drizzle-orm`, `drizzle-kit`)** — a TypeScript ORM chosen
over alternatives like Prisma because it's a thin, mostly type-inference
layer over SQL rather than a separate schema language + generated client.
Two halves:
- `drizzle-orm` is the runtime library — the `db.select()`/`db.insert()`
  query builder used in app code.
- `drizzle-kit` is the CLI/dev-time tool that reads `drizzle.config.ts` +
  `src/db/schema.ts` and generates/runs SQL migrations. It's a
  `devDependency` because it never runs in production, only when you
  change the schema locally.

**Stack Auth (`@stackframe/stack`)** — this is what Neon's dashboard
calls "Neon Auth": it's really the Stack Auth product, integrated into
Neon's console for convenience (it provisions its own auth tables inside
your Neon database automatically). Chosen over hand-rolling
password-hashing/sessions because this project only needs one login (the
dentist, for `/admin`) and Stack Auth's free tier covers that trivially —
building session management from scratch would be solving a problem a
well-tested library already solves correctly.

## `drizzle.config.ts` vs `src/db/index.ts` — two different jobs

These look similar (both import the schema, both need `DATABASE_URL`) but
run at different times and for different reasons:

- `drizzle.config.ts` is read by the `drizzle-kit` **CLI**, at
  migration-generation time, on your machine. It never ships to
  production.
- `src/db/index.ts` exports the `db` object the **app itself** imports at
  runtime to run queries — this is what a Server Action or API route will
  `import { db } from "@/db"` from.

Both throw early if `DATABASE_URL` is missing, rather than letting a
cryptic connection error surface later — fail fast, fail clearly.

## Why `dotenv-cli` in the npm scripts

Next.js automatically loads `.env.local` when you run `next dev`/`next
build`, but `drizzle-kit` is a standalone CLI tool with no idea Next.js
exists — run `npx drizzle-kit generate` directly and `DATABASE_URL` would
be undefined. The `db:generate` / `db:push` / `db:studio` scripts wrap the
real command with `dotenv -e .env.local --` so the same `.env.local` file
feeds both the app and the migration tooling, instead of duplicating
secrets in two places.

## `src/db/schema.ts` is currently a stub

It exports nothing (`export {}`) — just enough for `db/index.ts` and
`drizzle.config.ts` to have something to import so the project still
type-checks. The real `services` / `appointments` / `clinic_hours` tables
are next, in their own commit — schema design deserves to be reasoned
about on its own, not buried inside a "set up the tooling" commit.
