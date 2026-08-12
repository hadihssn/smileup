# Project context handoff

This file exists so a fresh Claude Code session (new account, new machine,
whatever) can pick this project up with full context, without the person
having to re-explain everything. If you're an AI assistant reading this at
the start of a new session: read this whole file before doing anything
else, then check `git log --oneline` and `docs/notes/` to confirm it's
still accurate (this file is a snapshot, not a live source of truth).

## What this project is

**SmileUp** — a marketing/booking website for a dental clinic. Single
scrolling page: nav, hero, "our approach" process section, services grid,
before/after gallery, meet-the-dentist, testimonials, clinic info + map,
appointment booking form, FAQ accordion, footer, floating WhatsApp button.

**Origin:** the user designed the site using Claude Design (Anthropic's
design tool) and exported a `.dc.html` handoff bundle, which is preserved
as-is in [`design-reference/`](../design-reference/) — read
[`design-reference/smileup-design/design_handoff_smileup_website/README.md`](../design-reference/smileup-design/design_handoff_smileup_website/README.md)
for the full original spec (sections, interactions, design tokens, what's
placeholder vs final). That file is the source of truth for *what the
design should look like*; this repo is the from-scratch Next.js
recreation of it.

**Current stage:** a complete, working static front-end. No backend.
Placeholder content throughout (see "What's still placeholder" below).

**Long-term plan (from the user, not yet started):** *if the site sells
and the client agrees* — add an AI chatbot for dental questions, a real
detailed appointment/booking system (this repo's form currently has no
backend), and an admin dashboard for the dentist to manage clinic content.
Nothing for this phase has been built yet; the codebase's data-modeling
choices (see below) were made with this phase in mind but no actual
backend/auth/admin work exists.

## Tech stack (and why)

Next.js (App Router) + TypeScript + Tailwind CSS v4, chosen explicitly
over plain HTML/CSS/JS or a client-only React+Vite setup because of the
long-term plan above — Next.js gives a natural path to API routes, an
admin section, and auth later, and deploys cleanly to Vercel.

- Next.js 16.2.12, React 19
- Tailwind v4 (CSS-based `@theme` config in `src/app/globals.css`, **not**
  a `tailwind.config.js` — v4 doesn't use one by default)
- Fonts: Poppins (headings) + Inter (body), self-hosted via
  `next/font/google` — this was one of two explicit choices the user made
  up front (chosen over "humanist" Inter-only or "editorial" Fraunces
  pairings that the original design file also supported)
- No test framework set up yet
- No CMS/database/backend — all content is static data in
  `src/data/site.ts`

**Read `AGENTS.md` / `CLAUDE.md` at the repo root before writing Next.js
code** — this project pins a Next.js version newer than typical model
training data and explicitly warns that APIs/conventions may differ from
what you expect; check `node_modules/next/dist/docs/` for the real docs
when in doubt (this was necessary at least once already, for the
`images.remotePatterns` config shape).

## Repo / git state

- GitHub: **https://github.com/hadihssn/smileup** (public)
- GitHub CLI (`gh`) is authenticated on this machine as `hadihssn`
- Local git commit author is set to `Hadi Hassan` /
  `hadihassan4443@gmail.com` — this is intentionally different from the
  `gh`-authenticated push account; both were left as the user's own
  machine defaults rather than unified
- `.claude/` (local Claude Code tool config, e.g. `launch.json` for the
  dev-server preview) is gitignored — it won't be present in a fresh clone
  and would need recreating (see "Resuming work" below)

### Commit history and the `docs/notes/` pairing

The user explicitly asked for two things that shaped how this was built:

1. **To learn to code alongside the build.** Solved with
   [`docs/notes/`](notes/) — one markdown file per commit, numbered to
   match the build order, explaining the concepts in that commit (why a
   Client Component boundary was needed, what `IntersectionObserver` does,
   why a `Set` instead of an object for the FAQ's open/closed state, etc.).
   These are explicitly kept **separate from the app code** — no bloated
   inline comments — read them alongside `git log` to follow the build
   step by step. **If you add new features in a future session, keep
   this pattern going**: one focused commit, one matching numbered note.
2. **To keep GitHub commit activity granular and pushed incrementally**,
   "one at a time," rather than one giant initial commit. Every commit in
   this repo is a working, buildable increment — `page.tsx` was updated in
   the *same* commit as each new section, not in one big "assemble
   everything" commit at the end. Keep doing this: small, real,
   independently-working commits, pushed as you go, not batched.

Run `git log --oneline` to see the actual sequence; as of this writing
it's 18 commits, `0a2e3d8` (design reference) through `557bc39` (a mobile
navbar overflow fix found during manual browser verification).

## Project structure

```
design-reference/          Original Claude Design export — read-only reference, do not edit
docs/
  notes/                    One learning note per commit (see above)
  PROJECT_CONTEXT.md         This file
src/
  app/
    layout.tsx               Root layout: fonts (next/font/google), <html>/<body>, metadata
    page.tsx                 Assembles every section in order — read this first for the site's structure
    globals.css               Tailwind v4 @theme tokens (colors, fonts, custom `nav:` breakpoint), scroll-reveal CSS
    icon.svg                  Favicon (brand mark), via Next's file-convention icons
  components/
    layout/                   Navbar, Footer, WhatsAppButton — persistent chrome, not page sections
    sections/                 One file per page section (Hero, Approach, Services, Gallery, Dentist,
                               Testimonials, ClinicInfo, Booking, Faq) — matches design-reference section order
    ui/
      Reveal.tsx               Shared scroll-reveal wrapper (see docs/notes/06) — use this for any new
                                 repeated/mapped card content; call useReveal() directly only for fixed,
                                 non-looped elements
  data/
    site.ts                    ALL site content lives here: services, journeySteps, gallery, testimonials,
                                 hours, faq, contact, navLinks, dentist. Add new content here, not inline in JSX.
  hooks/
    useReveal.ts                IntersectionObserver-driven fade/slide/scale-in
    useCountUp.ts                Animates numbers up once, on first scroll into view (hero stats)
```

### Patterns established — follow these for consistency

- **Content lives in `src/data/site.ts`**, typed with an `interface` per
  content shape, even for one-off content like the dentist bio (not just
  repeated lists). The reasoning: these shapes are exactly what the future
  admin dashboard would let the dentist edit, so keeping them as
  structured data now (not inline JSX) means the component layer doesn't
  change shape when that data starts coming from a database instead of a
  file.
- **`Reveal` component for mapped/repeated scroll-reveal content**, direct
  `useReveal()` calls for fixed non-looped elements — calling a hook
  inside `.map()` breaks the Rules of Hooks; see
  [`docs/notes/06`](notes/06-reveal-component-and-approach-section.md).
- **CSS handles what the browser already tracks** (hover, viewport width
  via the custom `nav:` breakpoint at 1080px), **React state handles what
  only the app knows** (menu open/closed, form data, FAQ open indexes).
  Don't reintroduce a JS resize listener for responsive layout — see
  [`docs/notes/04`](notes/04-navbar.md).
- **Tailwind v4 arbitrary values**: spacing/sizing utilities like `mb-5.5`
  or `min-w-80` work for *any* numeric multiple in v4 (calculated on the
  fly), but not everything is arbitrary this way — `duration`, `scale`,
  and `aspect-ratio` still need bracket syntax (`duration-[250ms]`,
  `scale-[1.08]`, `aspect-[4/5]`) for non-standard values. When in doubt,
  check whether the class actually applied via a computed-style check
  rather than assuming.
- **`next/image` requires `remotePatterns`** in `next.config.ts` for any
  external image host — currently only `images.unsplash.com` is
  allow-listed (all current photography is Unsplash placeholders).

## What's still placeholder (must change before real launch)

All flagged in `design-reference/.../README.md` and in code comments:

- Every photo (hero, dentist, gallery, testimonial avatars) is a hotlinked
  Unsplash stock photo
- Phone `+1 (555) 123-4567`, email `hello@smileup.clinic`, WhatsApp number,
  address `221 Maple Grove Ave, Suite 4, Springfield` — all placeholder
- Google Maps embed points at a generic "Springfield" query, not a real
  address
- Social links in the footer are `#` placeholders
- **The booking form has no backend.** Submitting just sets local React
  state and shows a success message — nothing is sent anywhere. See
  `src/components/sections/Booking.tsx`'s `handleSubmit` and
  [`docs/notes/12`](notes/12-booking-form.md).

## Resuming work in a new session

```bash
cd /path/to/smileup
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit    # typecheck
npx eslint .        # lint
npm run build       # production build check
```

If using the Claude Code browser-preview tool, recreate
`.claude/launch.json` (gitignored, not in the repo):

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "smileup-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```

**A note on browser-preview verification from this session**: the
automated preview browser used here had two quirks worth knowing about if
you hit similar oddities — (1) `requestAnimationFrame`-based animations
(the hero's count-up) don't run to completion because the preview tab
reports `document.hidden = true` and browsers pause rAF on hidden tabs —
not an app bug; (2) screenshots taken right after a scroll action
sometimes came back blank in that same tool. Both were worked around by
verifying via `get_page_text` / direct DOM/computed-style inspection
(`javascript_tool`) instead of relying purely on screenshots. If the new
session's tooling doesn't have these quirks, ignore this paragraph.

## Working with this user

- Wants to **learn to code through this build**, not just receive
  finished code — keep writing the `docs/notes/` entries for new work,
  explaining *why*, not just *what*.
- Wants **git history to double as a changelog and stay GitHub-active** —
  small commits, pushed incrementally, not batched.
- Is comfortable with technical explanations (React/Next.js concepts,
  CSS-vs-JS tradeoffs) written at a learning-but-not-beginner level — the
  existing notes in `docs/notes/` are a good calibration for tone/depth.
- Local machine is a Mac; `~/Downloads` is not accessible to the sandboxed
  shell used by Claude Code (macOS privacy permissions) — if the user
  attaches a file from Downloads again, ask them to move it into the
  project folder (or Desktop) first, as was done for the original design
  `.zip`.
