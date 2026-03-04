# Implementation Plan — Fuse Demo into Learn + Supabase Local Infra (Phase 1)

This plan captures the work to implement Story 008 (Fuse demo into Learn site) and the Supabase local infra and seed scripts required to run the demo locally (Story 010). It follows the repository workflow: create a short plan, get sign-off, then implement in small, reviewable commits on a feature branch.

Status
- Story 008 created and present in the backlog.
- Story 010 created and present in the backlog.
- This plan covers Phase 1: UI fusion + local Supabase dev flow + basic E2E tests.

Goals (Phase 1)
- Merge demo UI and flows into `sites/learn` under a `/demo` route.
- Provide a reproducible local Supabase developer flow (preferred: local Supabase developer tool) and idempotent seed scripts creating demo users and demo data.
- Use Supabase internal auth metadata / JWT claims and RLS for RBAC demonstration (no custom role tables in Phase 1).
- Add basic Playwright E2E smoke tests for auth flows and RBAC visibility.
- Add an adapter-cycle harness that runs the E2E tests for `supabase` (real) and runs with mocked external adapters for others.

Assumptions & constraints
- Local developers will use the Supabase local developer tooling (recommended) for local demo runs. A Docker Compose fallback will be provided for CI or developers who cannot install the local tooling.
- The seed script will use a local service-role key (from the local Supabase instance) or accept a service key via env var to create users programmatically.
- For Phase 1, simple RLS policies will be demonstrated; most UI gating will be enforced in the demo app UI and backed by a minimal RLS example.
- External OAuth providers will be mocked for local E2E runs; real provider credentials are out of scope for Phase 1.

Deliverables
1. Branch: `feature/008-fuse-demo-into-learn`.
2. In `sites/learn`:
   - `/src/routes/demo/+page.svelte` — demo auth page (email/password + magic link + social start buttons).
   - `/src/routes/demo/app/+page.svelte` — mini-app dashboard + RBAC demo pages.
   - API routes for session and demo resources (`/api/session`, `/api/demo/posts`, etc.) that use Supabase server client when available.
   - `src/lib` helpers for reading env config and simple auth helper utilities.
3. Supabase local infra & seed:
   - `solution/scripts/dev-local-supabase.sh` — boots local Supabase, seeds DB, then starts the learn dev server.
   - `solution/sites/learn/supabase/seed.sql` — schema + sample data + RLS policies (posts table example).
   - `solution/scripts/supabase-seed.js` — idempotent JS seeding that uses a service-role key or local tooling to create demo users and set metadata (role).
   - `solution/docker-compose.supabase.yml` — fallback compose configuration for CI/runners.
   - `.env.example` for local dev env variables.
4. Playwright E2E:
   - `solution/sites/learn/e2e/auth.spec.ts` — test sign-in/sign-up (password) and magic link send flow.
   - `solution/sites/learn/e2e/rbac.spec.ts` — login as seeded users and assert role-based UI.
   - `solution/scripts/cycle-adapters-and-test.js` — harness to run tests per adapter (default `supabase`, other adapters mocked).
5. Documentation:
   - `solution/sites/learn/README.md` — run & seed instructions, env vars, test commands.
   - Update `docs/stories/README.md` (Active) to list this story and the Supabase infra story.
   - Add a CI snippet describing how to run the compose fallback in a GitHub Actions job (implementation may come in follow-up).

High-level tasks (execution order)
1. Create feature branch `feature/008-fuse-demo-into-learn`.
2. UI & routing (small, reviewable commits)
   - Add `/demo` route to `sites/learn`.
   - Add header link to `/demo` in `sites/learn` layout.
   - Copy/adapt minimal demo components from `sites/demo` (auth UI, header, cards). Prefer reusing shared UI package components where appropriate.
3. Minimal server APIs (server-side)
   - Add `/api/session` endpoint that will try to resolve a Supabase user from a bearer token or known cookie values and return `{ user }` or 401.
   - Add `/api/demo/posts` endpoints that read/write demo content using an admin client if available (service role key) or fall back to anon client.
4. Supabase client + env helpers
   - Add `sites/learn/src/lib/supabase.js` (or `.ts`) to centralize reading env config, exposing server/client factory helpers and test overrides.
   - Add `sites/learn/src/lib/auth.js` helpers to extract the role from session metadata and provide `hasRole()` utility for the UI.
5. Supabase seeds & local startup
   - Add `seed.sql` with `posts` table and minimal RLS policies.
   - Add `supabase-seed.js` that:
     - Accepts env var `SUPABASE_SERVICE_ROLE_KEY` or reads local service key.
     - Creates demo users with known passwords and sets user metadata `role` claim (admin/editor/viewer).
     - Inserts sample posts and sets `owner` and `visibility`.
     - Is idempotent.
   - Add `dev-local-supabase.sh`:
     - Detect local supabase tooling; if present run local start and wait for readiness.
     - Otherwise start the Docker Compose fallback.
     - Run the seed script and then start the `learn` dev server.
6. Playwright E2E
   - Add tests for auth and RBAC behaviors.
   - Configure Playwright to accept env vars for `APP_URL`, `SUPABASE_URL`, and keys for test runs.
   - Provide a login helper that uses the seed credentials to create an authenticated session rapidly (bypass UI when needed).
7. Adapter-cycle harness
   - Implement `cycle-adapters-and-test.js` that:
     - Accepts a list of adapters.
     - For each adapter, sets env override and runs the Playwright test suite.
     - For non-local adapters, set up a mock adapter to keep tests reproducible.
8. Docs & polish
   - Add `solution/sites/learn/README.md` with step-by-step local dev and test instructions.
   - Add instructions for the CI fallback (compose) and example GitHub Actions snippet in docs.
9. Local validation & iteration
   - Run the full dev-local flow and iterate until seeds + app + tests run successfully.
   - Keep commits small and open PR(s) for review.

Acceptance criteria (Phase 1)
- `learn` site has a `/demo` route with a sign-in page and a demo mini-app.
- Demo mini-app shows different UI for `admin`, `editor`, and `viewer` based on Supabase user metadata/claims.
- Local seed script creates three users with credentials:
  - `admin@example.com` / `AdminPass123`
  - `editor@example.com` / `EditorPass123`
  - `viewer@example.com` / `ViewerPass123`
- `dev-local-supabase.sh` boots a local Supabase instance, applies seeds, and starts the `learn` dev server (or documents how to perform equivalent steps manually).
- Playwright smoke tests for auth and RBAC run successfully against the seeded local instance.
- Adapter-cycle harness runs the E2E suite for the `supabase` adapter and can run tests with mocked adapters for the others.
- Documentation added to `solution/sites/learn/README.md` and `docs/stories/README.md` references this plan/story.

Risks & mitigations
- Creating auth users programmatically requires a service-role key: local developer tooling provides this for development. The seed script will accept a service key via env var and fail fast with a clear error message if missing.
- RLS complexity may make some operations fail when using anon client: mitigation is to use the admin client for seeds and for demo endpoints as appropriate—also document the limitations.
- Dependency mismatches between `demo` and `learn` sites (SvelteKit versions, UnoCSS) can cause styling issues: mitigation is to copy minimal components first and re-use shared UI packages where possible.

Timeline & effort (rough)
- UI merge & routing: 1–1.5 days
- Supabase seeds & CLI integration: 1 day
- Playwright tests (auth + RBAC): 1–1.5 days
- Adapter-cycle harness & mocks: 0.5–1 day
- Docs & polish, iteration: 0.5 day
Estimated Phase 1 total: ~5 working days (split into multiple PRs for faster review).

PR / branch strategy
- Create `feature/008-fuse-demo-into-learn`.
- Make small commits grouped by task (UI, API, seed scripts, E2E).
- Open a WIP PR early for visibility; add description referencing this plan and linked story ID.

Next steps (what I will do after you confirm)
1. Create the feature branch and add the initial scaffolding commit for the `/demo` route and header link.
2. Implement the session API and a minimal demo dashboard that reads from the session API.
3. Add seed SQL + JS script and the local start script (local tooling preferred; Docker Compose fallback).
4. Implement the Playwright smoke tests and the adapter-cycle harness.
5. Iterate until the local flow and E2E pass; open PR(s) for review.

If you confirm I should start, I will create the feature branch and begin with the minimal UI + session API scaffolding commit, then follow the plan in small increments. If you have any adjustments to scope or priorities, let me know before I begin.