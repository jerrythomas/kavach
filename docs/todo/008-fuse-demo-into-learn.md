# 008 — Fuse demo into Learn site

## Summary

Merge the existing `demo` site functionality into the `learn` site to produce a single canonical site that:

- Hosts the learning content (slides, docs, guides).
- Exposes a header link "Demo" that navigates to an authentication page and a small, auth-gated mini-app.
- The mini-app demonstrates core features (authentication flows, role-based access control, protected resources, and example adapter behaviors).
- Uses Supabase as the canonical demo backend (local supabase for development, production Supabase via env vars).
- Provides seed data (users with roles) and scripts to run local Supabase, seed it, and run end-to-end Playwright tests. Also includes a script to cycle through adapters and run the e2e suite.

This story focuses on design, scaffolding, and implementation tasks to fuse demo -> learn and add the required infra for local dev and automated e2e verification.

> Note: There is a companion story for a full codebase analysis & cleanup (story 009). Per your priority request, this story will be implemented before that analysis.

## Motivation

- Reduce duplication: maintain a single site (`learn`) for documentation and the live demo.
- Provide a hosted demo experience that showcases auth patterns (RBAC, magic link, password, oauth where feasible).
- Make local development reproducible with seeded Supabase and automated e2e tests to guard future refactors.
- Provide a clear QA workflow for testing adapters and ensuring upgrades don't regress behavior.

## Current state analysis

See the target unification design in [docs/design/07-website.md](../design/07-website.md) for the full future-state blueprint that this story implements.

| Site | Strengths | Gaps / Issues |
|------|-----------|---------------|
| `sites/demo` | Latest SvelteKit structure, feature-complete demo flows, role switching. | Needs TypeScript alignment; informational content minimal; siloed layout/components. |
| `sites/learn` | Informational copy, high-level documentation intent, tests skeleton. | Outdated structure vs. `demo`; lacks integrations; duplicate logic; underpowered demo flows. |
| `sites/skeleton` | Minimal starter for downstream reuse. | Redundant relative to unified learn site; duplicative config; not actively maintained. |

Key concerns to address in this story: fragmentation, duplicated layouts, inconsistent navigation, and absence of a canonical home for verification/publish metadata.

## Goals & Non-goals

Goals
- Fuse the UI and routes from `sites/demo` into `sites/learn`.
- Provide a `/demo` route inside `learn` that:
  - Shows an auth page (sign-in, sign-up, magic link).
  - After sign-in, shows a small mini-app with role-protected screens (Admin Panel, Editor Tools, Read-only area).
- Provide environment configuration for Supabase:
  - Local dev uses the Supabase CLI or Docker (developer preference: Supabase CLI).
  - Prod uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Provide seed scripts to create sample users with roles (admin/editor/viewer) and minimal demo data.
- Add a runnable script that cycles adapters (e.g., `supabase`, `firebase` (mocked), `auth0` (mocked)) and runs Playwright e2e for each.
- Place Playwright tests in `solution/sites/learn/e2e` (or `solution/e2e` if centralized).
- Provide documentation and update `docs/stories/README.md` index (task included).

Non-goals
- Full migration of serverless deployment infra or production secrets management (we will provide instructions and env expectations).
- Implementing real OAuth flows for external providers using live credentials (we will mock/simulate these in e2e where appropriate).

## Acceptance criteria

1. Local setup:
   - Running `./solution/scripts/dev-local.sh` (or equivalent documented script) starts:
     - local Supabase (via `supabase start` or docker-compose)
     - seeds demo data
     - starts the `learn` dev server
   - Developer can sign in (email/password) using seeded users.

2. App behavior:
   - The `learn` site header contains a "Demo" link that navigates to `/demo` (or `/auth/demo`).
   - The `/demo` page includes:
     - A sign-up/sign-in form (email/password).
     - A magic-link request form (only informational: shows "Magic link sent...").
     - After successful sign-in, a mini-app with:
       - Dashboard showing user info and role.
       - "Admin Panel" visible only to `admin` users.
       - "Editor Tools" visible to `editor` and `admin`.
       - "Reader View" visible to all authenticated users.
   - Role-based UI and route guards are enforced client-side, and appropriate server-side (where applicable) checks are present using Supabase claims/row-level security where feasible (for demo purposes).

3. Seed data:
   - Seed file(s) exist that create at least three users:
     - `admin@example.com` / `AdminPass123` (role: admin)
     - `editor@example.com` / `EditorPass123` (role: editor)
     - `viewer@example.com` / `ViewerPass123` (role: viewer)
   - Seed script applies these users and sets roles (via Supabase `auth.admin` / metadata or a demo roles table).

4. Tests:
   - Playwright e2e tests exist that:
     - Start the app and local Supabase (or assume it's running).
     - Test sign-up/sign-in for password flows (using seeded users).
     - Test magic-link send flow (assert informational UI).
     - Test role-based content visibility and access (admin/editor/viewer).
     - Run with a script that cycles adapters; at minimum the script runs the tests with the `supabase` adapter and with other adapters mocked (no external network credentials required).
   - Running `npm run test:e2e` (from the site root) runs the e2e suite and passes.

5. CI:
   - There is a documented plan for adding a GitHub Actions job that:
     - Spins up Supabase (via Docker Compose or supabase CLI) in the runner.
     - Runs the adapter-cycle script and Playwright tests.
     - Uploads artifacts (screenshots, trace) on failure.
   - (Implementation of CI job can be done in follow-up story if desired).

6. Documentation:
   - `docs/stories/008-fuse-demo-into-learn.md` (this file) is created.
   - `docs/stories/README.md` is updated to include this story under Active (task included in implementation tasks).
   - A short README inside `solution/sites/learn/README.md` explains the demo route, how to run local Supabase, and how to run e2e tests.

## Implementation tasks (high-level)

1. Project planning & design
   - Create branch `feature/008-fuse-demo-into-learn`.
   - Update `docs/plans/README.md` with a mini-plan referencing this story (per workflow).
   - Update `docs/stories/README.md` to add this story to Active (task in code work).

2. UI/route integration
   - Merge necessary demo UI files into `sites/learn`:
     - Create `/src/routes/demo/+page.svelte` (auth page) and `/src/routes/demo/(app)/+layout.svelte` for the mini-app.
     - Reuse components from `sites/demo` (login forms, cards, AuthProvider UI) where sensible; otherwise refactor into `@kavach/ui` or `sites/learn/src/lib/components`.
   - Add header link in `sites/learn/src/routes/+layout.svelte` to `/demo`.

3. Auth & RBAC
   - Add Supabase client config in `sites/learn/src/lib/supabase.js` (reads env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
   - Implement RBAC helpers:
     - `src/lib/auth.js` with `getRole()`, `hasRole()`, `protectRoute()` utilities.
   - Implement minimal server-side checks or use client-side claims with Supabase custom claims / metadata for demo.

4. Supabase infra & seeding
   - Create `solution/sites/learn/supabase/seed.sql` (or a JS script using `@supabase/supabase-js`) to:
     - Create `roles` enum/table if needed.
     - Create demo tables and insert sample rows.
     - Create or upsert demo users and set their roles (for local dev using the Supabase Admin API or CLI).
   - Add `solution/scripts/start-local-supabase.sh` (or `start-local-supabase.js`) that:
     - Validates `supabase` CLI or Docker presence.
     - Starts Supabase in a reproducible manner.
     - Runs seeding script and exits with success/failure.
   - Document steps to configure local Supabase, including `supabase login` and local service key usage.

5. Adapter-cycle + e2e harness
   - Add script `solution/scripts/cycle-adapters-and-test.js` which:
     - Accepts a list of adapters (default `['supabase']`).
     - For each adapter:
       - Patches `sites/learn` config/env to use that adapter (or sets an override env var).
       - Starts the dev server (or uses a headless build + preview).
       - Runs Playwright e2e tests with adapter-specific env.
     - Exit code non-zero if any adapter+test fails.
   - For adapters that cannot be run locally (Firebase, Auth0, etc.) provide a mocking layer:
     - Playwright can start with a `TEST_ADAPTER=mock-firebase` env and use test doubles for SDK calls.

6. Playwright tests
   - Add e2e tests under `solution/sites/learn/e2e` (or `solution/e2e`):
     - `auth.spec.ts` — sign-up, sign-in (password), magic link (send only), sign-out.
     - `rbac.spec.ts` — login as seeded admin/editor/viewer and assert UI and route visibility.
     - `adapter-switch.spec.ts` — exercise adapter-cycle logic (or call the script and assert).
   - Add `package.json` scripts:
     - `sites/learn`: `"test:e2e": "playwright test"` and `"test:e2e:ci": "playwright test --reporter=dot"`.

7. Docs & README
   - Update `solution/sites/learn/README.md` with local-run steps:
     - env vars
     - starting Supabase
     - seeding
     - dev server
     - running e2e
   - Add a short note in `docs/stories/README.md` (Active) linking to this story.

8. Cleanup and follow-up
   - Once merged, remove redundant demo deployment (if desired) or keep `sites/demo` as an archive branch for reference.
   - Add companion story (009) for full codebase analysis and refactor (prioritized after merge).

## Detailed deliverables

Files to add/modify (examples)
- `kavach/docs/stories/008-fuse-demo-into-learn.md` (this file)
- Branch: `feature/008-fuse-demo-into-learn`
- `solution/sites/learn/src/routes/demo/+page.svelte` — demo auth page
- `solution/sites/learn/src/routes/demo/(app)/+page.svelte` and subroutes for admin/editor/viewer
- `solution/sites/learn/src/lib/supabase.js` — Supabase client wrapper (reads env)
- `solution/sites/learn/src/lib/auth.js` — RBAC utilities
- `solution/sites/learn/supabase/seed.sql` (or `seed.js`) — seed users and roles
- `solution/scripts/start-local-supabase.sh` — start + seed
- `solution/scripts/cycle-adapters-and-test.js` — adapter cycling + e2e runner
- `solution/sites/learn/e2e/*.spec.ts` — Playwright tests
- `solution/sites/learn/README.md` — local dev and testing docs
- Update `kavach/docs/stories/README.md` to list this story under Active

## Risks & mitigations

- Seed user creation may require the Supabase Admin API or service role key for password creation; local Supabase CLI usually supports creating users — the seed script should handle both CLI and API paths.
  - Mitigation: Provide both a SQL-based seed and an admin-API-based JS seed; detect environment and use the appropriate method.

- External OAuth flows (Firebase/Auth0) cannot be tested fully without credentials.
  - Mitigation: Mock those SDKs in the e2e tests and verify UI flows and transforms.

- Existing tests across adapters might assume different `synchronize()` semantics (we saw variations earlier).
  - Mitigation: Keep adapter-specific behavior unchanged for now; the separate analysis/refactor story will standardize contracts across adapters.

## Open Questions

1. Should docs remain within core repo or be decoupled into a dedicated content repository?
2. How to balance informational design assets with accessible markup (need design audit before implementation)?
3. Are additional public asset formats (e.g., interactive sandboxes) in scope for future publishes?

---
