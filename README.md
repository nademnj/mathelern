# MatheLern

Interactive math-learning web app for the Bavarian LehrplanPLUS curriculum
(Gymnasium G9, grades 5–13). Pilot scope: grade 5 and 6, full vertical slice
(lessons, adaptive exercises, progress/milestones, parent dashboard).

See the full architecture/plan behind this build for context on design
decisions, data model, and the adaptive difficulty algorithm.

## Tech stack

Next.js 16 (App Router) + TypeScript, Tailwind v4 + shadcn/ui, Supabase
(Postgres + Auth), Vitest for unit tests, Playwright for e2e (not yet
written).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** (EU/Frankfurt region, for GDPR data
   residency with minors' data) at [supabase.com](https://supabase.com). This
   step needs a Supabase account — it can't be done from here.

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project's Settings → API
   page. The service-role key is server-only (used by Server Actions and
   `scripts/sync-content.ts` to bypass RLS for account bootstrap, answer
   secrecy, and content sync) — never expose it to the browser.

4. **Run the database migrations** — in the Supabase dashboard's SQL editor,
   run each file under `supabase/migrations/` in order (0001 → 0004), then
   run `supabase/seed.sql`. (If you have the Supabase CLI set up and linked
   to the project instead, `supabase db push` applies the migrations, and
   `psql` or the SQL editor can run `seed.sql`.)

5. **Sync lesson content into the database**
   ```bash
   npm run sync-content
   ```
   This validates every file under `content/lessons/**/*.json` against the
   zod schema and upserts it into the `lessons` table. Run
   `npm run sync-content:check` (no DB writes) to just validate — useful in
   CI/pre-commit.

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Verifying the pilot flow end-to-end

1. Register a student account (grade 5 or 6) at `/register`.
2. From the dashboard, open the one published topic for that grade and
   complete its lesson (`Das Stellenwertsystem verstehen` for grade 5,
   `Bruchteile verstehen` for grade 6).
3. Start the topic's exercises, answer a few — watch the difficulty tier and
   mastery score move, and the worked solution appear after each attempt.
   Answer wrong 3 times in a row to see the "struggling" nudge and remedial
   (easier) exercises kick in.
4. Visit `/progress` to see the topic mastery bar and any milestone badges
   earned.
5. Copy the invite code shown on the student dashboard. Register a parent
   account at `/register/parent`, enter the code on the parent dashboard to
   link the child, then open the child's detail page to see their progress
   and (after enough struggling) a generated recommendation.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run sync-content` | Validate + upsert `content/lessons/**` into Postgres |
| `npm run sync-content:check` | Validate only, no DB writes |
| `npm run test` | Run Vitest unit tests (`lib/adaptive`, `lib/generators`) |
| `npm run test:e2e` | Run Playwright e2e tests (none written yet) |

## Project structure

- `app/` — routes: `(auth)` for login/register, `(student)` for the student
  area, `parent/` for the parent area, `(dev)/viz-gallery` for a dev-only
  showcase of the interactive visual components, `api/exercises/*` as a REST
  mirror of the exercise Server Actions for a future mobile client.
- `actions/` — Server Actions (auth, lessons/progress, exercises, parent
  linking/recommendations). All DB writes that need to bypass RLS (account
  bootstrap, answer secrecy, milestone/recommendation generation) go through
  `lib/supabase/admin.ts`, server-only, never imported by client code.
- `components/` — `lesson/` (lesson player + storyboard renderer),
  `visuals/` (the 7 reusable interactive diagram components + registry),
  `exercise/` (the adaptive exercise runner UI), `progress/` (mastery bars,
  roadmap, milestone badges), `parent/` (dashboard cards, linking form).
- `lib/adaptive/` — the pure, unit-tested mastery/difficulty-ladder logic.
- `lib/generators/` — seeded-PRNG exercise generators (deterministic by
  `{generator_key, seed}`, so any served question is reproducible).
- `lib/content/lessonSchema.ts` — zod schema for lesson JSON content; keep in
  sync with `components/visuals/VizRegistry.ts`.
- `content/lessons/grade-{5,6}/*.json` — authored lesson content (git-
  reviewable; add new grades/topics purely by adding files + topic rows).
- `supabase/migrations/` — schema + RLS policies, applied in order.
- `supabase/seed.sql` — grades 5–13, pilot topics, the exercise catalog for
  the two pilot topics, and milestones.

## Known gaps / next steps

- Only grade 5 ("Das Stellenwertsystem") and grade 6 ("Bruchteile") have a
  published lesson + exercises; all other seeded topics are
  `is_published = false` placeholders for future content authoring.
- No real recorded video yet — lessons render their storyboard/script
  instead; `lessons.video_url` is wired up and ready for when video exists.
- Grade 5/6 chapter numbering beyond the explicitly `(confirmed)` chapters
  in the pilot content outline should be spot-checked against a current
  approved textbook or the live LehrplanPLUS site before content lock.
- No Playwright e2e test yet (suggested: register → lesson → exercises →
  parent link → recommendation, as the standing regression test).
- Parent-initiated signup (parent creates the account, invites the child) is
  worth reconsidering before any real launch, per common German
  data-protection practice for minors — this pilot uses the simpler
  student-signs-up/parent-joins-via-code flow for speed.
