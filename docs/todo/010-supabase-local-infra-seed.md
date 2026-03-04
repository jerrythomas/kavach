# 010 Supabase local infra & seed scripts

## Summary

Provide a reproducible local Supabase developer experience for the demo/learn site:
- Scripts to start a local Supabase instance (CLI or Docker).
- Seed scripts to create demo users, roles, and example data.
- Helpers for CI to run Supabase in ephemeral runners.
- Documentation and local run scripts that integrate with the `learn` site demo route and Playwright e2e tests.

This story enables developers to run the full demo locally (including RBAC examples) and provides the infra foundation for E2E tests that exercise adapters against a predictable backend.

---

## Motivation

- The demo requires a backend with authentication, roles, and demo data. Supabase is the canonical demo backend.
- Developers must be able to boot a fully seeded local instance quickly and deterministically.
- CI must be able to spin up Supabase, run tests, and tear down without manual steps.
- Seed data should support a few demo users with roles (`admin`, `editor`, `viewer`) plus demo content.

---

## Goals

1. Add scripts to start and stop a reproducible local Supabase instance.
2. Add seed scripts that create:
   - Users with passwords and assigned demo roles.
   - A small `posts` (or `items`) table with sample rows whose access is role-protected (via RLS policies where feasible).
   - A `roles` table or metadata use that the app can read to determine UI capabilities.
3. Add a simple JS-based seeding tool (uses `@supabase/supabase-js` with a service-role key) and a fallback SQL migrate/seed file.
4. Add tooling to run Supabase in CI (docker-compose or a small container flow), plus examples for GitHub Actions.
5. Document env vars and local vs prod configuration.
6. Ensure Playwright tests can run against the seeded instance and verify RBAC behavior.

---

## Non-goals

- Production-grade database migration system (only simple seeds/migrations for demo).
- Full-blown orchestration of many services (only Supabase).
- Real OAuth credential management for external providers (we will mock those flows for local E2E).

---

## Requirements

- Command(s) to start local Supabase:
  - Recommended default: `supabase` CLI (`supabase start`) when present.
  - Fallback: `docker-compose up` using an included `docker-compose.supabase.yml`.
- Seed scripts:
  - `scripts/supabase-seed.js` — JavaScript seeding using the Supabase Admin (service role) key.
  - `supabase/seed.sql` — SQL file to be applied if using direct SQL import.
- Default demo users and roles:
  - `admin@example.com` / `AdminPass123` → role: `admin`
  - `editor@example.com` / `EditorPass123` → role: `editor`
  - `viewer@example.com` / `ViewerPass123` → role: `viewer`
- The seed must set user metadata or a roles table so the application can query role membership.
- A `scripts/dev-local.sh` (or `.ps1`/`.bat`) that:
  - Starts Supabase (CLI or Docker), waits for readiness, runs the seed, then starts the SvelteKit `learn` dev server.
- Playwright configuration to point tests to the seeded Supabase endpoint and use seeded credentials.
- A documented `CI` snippet for GitHub Actions with Docker Compose or a runner image that supports the supabase CLI.

---

## Design considerations

- Local dev ergonomics:
  - Prefer the `supabase` CLI for local dev when available: easier (single command) and consistent behavior.
  - Provide `docker-compose.supabase.yml` for developers/CI that cannot install the Supabase CLI.
- Seeding approach:
  - JS seeding script advantages:
    - Can create auth users (via supabase admin API) and set user metadata easily.
    - Can create/demo insert rows and apply RLS policies via SQL.
  - SQL seeding advantages:
    - Simpler for CI db bootstrapping and for deterministic repro of schema.
  - Implement both: JS primary for developer-friendly user creation; SQL for reproducible db schema & sample content.
- Security:
  - Service role keys must not be committed. For local use, the supabase CLI provides service keys in `.supabase` and local env files. The seeding script should accept a `SERVICE_ROLE_KEY` env var and fail early if missing.
- Idempotency:
  - Seeds must be idempotent — safe to run multiple times without producing duplicate users or rows.
- Row-level security (RLS):
  - For a realistic demo, add simple RLS policies to `posts` so that:
    - `admin` can read/write/delete any row.
    - `editor` can insert/update their own rows, and read all.
    - `viewer` can read public rows only.
  - The seed SQL will create `posts` with a `visibility` field and `owner` foreign key.

---

## Tasks

1. Add scripts and files
   - `solution/scripts/dev-local-supabase.sh` — Start Supabase (CLI or Docker), seed DB, start dev server.
   - `solution/scripts/supabase-seed.js` — JS seed script using `@supabase/supabase-js`.
   - `solution/sites/learn/supabase/seed.sql` — SQL schema + sample data + RLS policies.
   - `solution/docker-compose.supabase.yml` — Docker compose for Supabase services.
   - `solution/sites/learn/.env.example` — Example env variables for local dev (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
   - `solution/scripts/ci-supabase-setup.sh` — Lightweight CI helper for Github Actions.

2. Seed details (JS script)
   - Connect using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   - Create `roles` table if not exists.
   - Create demo users using the `auth.admin.createUser` or the Management API:
     - If using local supabase CLI, prefer direct insert into `auth.users` is not supported — must use Admin API or `supabase` CLI helper. Use the JS admin method where possible.
   - Upsert users and attach role in a `user_roles` table or via `user_metadata` field.
   - Create `posts` sample data with at least 6 rows distributed among owners and visibilities.

3. SQL seed
   - `seed.sql` should:
     - Create tables `roles`, `user_roles`, `posts`.
     - Create policies and functions needed for RLS.
     - Insert sample roles and rows.
   - Document how to apply it: `psql` or `supabase db reset` / `supabase db push` workflows.

4. Scripts and wrappers
   - `dev-local-supabase.sh` flow:
     1. Detect `supabase` CLI (`command -v supabase`).
     2. If present:
        - `supabase start` (or `supabase start --no-db` if needed).
        - Export environment variables (read from `.supabase/local/*` or `supabase` outputs).
     3. Else:
        - `docker compose -f docker-compose.supabase.yml up -d`.
        - Wait for the Postgres and auth endpoints to be healthy.
     4. Run `node solution/scripts/supabase-seed.js`.
     5. Start the `learn` dev server (e.g., `pnpm --filter sites/learn dev` or `cd solution/sites/learn && npm run dev`).
   - A `stop-local-supabase.sh` that stops either the supabase CLI or brings down docker compose.

5. Playwright integration
   - Update `sites/learn/playwright.config.js` to accept environment variables:
     - `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, `TEST_SUPABASE_SERVICE_ROLE_KEY`, and `TEST_APP_URL`.
   - Add test helper to create sessions programmatically using the seed credentials for faster test login (bypass UI where appropriate).
   - Add e2e tests that assert:
     - Seeded users can log in.
     - RBAC UI changes occur for `admin`, `editor`, `viewer`.

6. CI snippet (docs only)
   - Provide a sample GitHub Actions job:
     - Use `ubuntu-latest`.
     - Start docker-compose with `docker-compose -f solution/docker-compose.supabase.yml up -d`.
     - Wait for readiness.
     - Run `node solution/scripts/supabase-seed.js` with a generated temporary service key (or use a pre-provisioned secret).
     - Run `pnpm --filter sites/learn test:e2e` or `bun run` equivalent.
     - Upload Playwright artifacts on failure.

7. Docs & README
   - `solution/sites/learn/README.md` should:
     - Explain environment variables.
     - Explain local dev bootstrap: start supabase, seed, run site, run e2e.
     - Explain how to re-seed and tear down.
   - Add a short note in `kavach/docs/stories/README.md` linking to this story.

8. Tests and validation
   - Run the local flow end-to-end and validate seeded users and RBAC behaviors.
   - Iterate until Playwright tests are green locally.

---

## Example seed shapes (illustrative)

- Table `roles`:
  - `id` text primary key (`admin`, `editor`, `viewer`)
  - `label` text

- Table `user_roles`:
  - `user_id` uuid references `auth.users` (or stored as text uid)
  - `role_id` text references `roles`

- Table `posts`:
  - `id` uuid primary key
  - `title` text
  - `body` text
  - `owner` uuid
  - `visibility` text (`public` | `private`)

- RLS sample:
  - `select` policy: allow all authenticated users to select if `visibility = 'public'` OR `auth.uid() = owner` OR role is `editor`/`admin`.
  - `insert` policy: allow `editor`/`admin` to insert; allow `viewer` only if certain conditions.
  - `update`/`delete` policies: owner or admin only.

Notes:
- Supabase RLS uses `auth.uid()` and `current_setting('jwt.claims.role')` (or custom JWT claims) depending on approach. For demo, we can keep role checks in application logic and provide a simple RLS example for illustration.

---

## Acceptance criteria

- `solution/scripts/dev-local-supabase.sh` starts local Supabase (via CLI or docker), seeds DB, and starts the `learn` dev server.
- Seed script creates three demo users and assigns roles; the app can authenticate with those credentials.
- SQL seed exists and can be applied manually for CI or for users preferring SQL-only flow.
- Playwright e2e tests can run against the seeded instance and assert RBAC-based UI differences.
- Documentation explains steps and required env vars and demonstrates how to re-seed.

---

## Risks & mitigations

- Creating auth users programmatically requires a service role key and the correct API; local supabase CLI may provide easier mechanisms:
  - Mitigation: Provide both JS admin seeding (requires `SUPABASE_SERVICE_ROLE_KEY`) and an alternate path using `supabase` CLI + SQL for local-only flows.
- RLS complexity:
  - Mitigation: Keep RLS minimal for demo; rely on app-side role checks for UI gating and simple RLS for public/private rows.
- CI runners may not support the supabase CLI:
  - Mitigation: Provide a `docker-compose.supabase.yml` fallback suitable for GitHub Actions.

---

## Estimated effort

- Scaffolding scripts + SQL seeds: 1 day
- JS seeding script + idempotency: 0.5 day
- Docker-compose + CLI detection and dev script: 0.5 day
- Playwright integration & tests: 1.5 days
- Docs + CI snippet: 0.5 day

Total: ~4 — 5 work days.

---

## Next steps

When you confirm this story, I will:
1. Create branch `feature/010-supabase-local-infra-seed`.
2. Add the scripts and seed files as listed.
3. Add documentation and example CI snippet.
4. Validate locally and with Playwright until green.
5. Open a PR and link it back to the story.

If you prefer I can also:
- Implement a quick proof-of-concept seed immediately (small JS script + few SQL statements).
- Or prioritize the Docker Compose fallback first so CI can run without installing the supabase CLI.

Please confirm which fallback you prefer for CI (Docker Compose or pre-installed supabase CLI on runner).