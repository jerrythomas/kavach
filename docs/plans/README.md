# Active Plan

## Local supabase stack + real-auth demo e2e (2026-08-16)

**Feature:** `docs/features/demo.md` (F7 Verification)
**Status:** 🟡 **Active**

### Goal

The demo's Playwright suite only exercised stubbed cookies; real UI-driven
sign-in was impossible because (a) the local supabase stack collided with the
`sensei-dojo` stack (both on the default 5432x ports), and (b) the UI had bugs
that only surface against a real provider (uninitialized client click race,
info/error messages never rendered, session not synced before navigation).

### Tasks

| #   | Task                                     | Deliverable                                                                                                                                   | Verify                                                              |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Repoint supabase ports off `sensei-dojo` | `supabase/config.toml` (api 54331, db 54332, studio 54333, mailpit 54334); demo env files; e2e fixtures                                       | `supabase start` clean; password sign-in via curl                   |
| 2   | Seed users that survive GoTrue scan      | `supabase/seed.sql` sets token/flag columns non-null (GoTrue v2.192 "converting NULL to string")                                              | `curl` token exchange 200 for test/admin                            |
| 3   | Allow magic-link redirect to the app     | `auth.additional_redirect_urls += http://localhost:4173`; adapter's `emailRedirectTo` already sends `redirect_to` query                       | mailpit link carries `redirect_to=http://localhost:4173`            |
| 4   | Client-ready gating + shared bootstrap   | `$lib/client-kavach.js`; root layout sets `kavach` + `kavach-ready` context; `(app)` layout reuses helper; `/auth` gates providers on `ready` | auth page renders providers only once client is hydrated            |
| 5   | AuthProvider result surfacing            | render `result.message` inline (`data-auth-result`); don't navigate on `type: 'info'`                                                         | magic-link "sent" message visible; wrong-password error inline      |
| 6   | Session sync before navigation           | `handleSignIn` awaits `syncSessionWithServer` when the adapter returns a session                                                              | dashboard reachable after password sign-in without a logout/refresh |
| 7   | Auth-aware landing CTA                   | `+page.svelte` shows "Go to dashboard" when `data.user`, else "Sign in to try it"                                                             | both states verified in e2e                                         |
| 8   | Real-auth e2e suite                      | `sites/showcase/e2e/auth-ui.e2e.ts` (landing CTA, password sign-in, wrong password, magic link via mailpit)                                   | `bun run test:e2e:supabase` green                                   |

### Follow-ups

- Port `sites/learn` to the showcase kit.
- Per-adapter site deployments + CI (feature F3/F5).

---

## Showcase Kit — v1 (components + config + tests)

**Feature:** `docs/features/demo.md` (F1 Shared Kit, F2 Shared Config, F7 Verification)
**Design:** `docs/design/10-showcase.md`
**Status:** **Archived** — v1 landed in commit `4acaed2` (all 9 tasks, e2e green
across all 3 adapters). See `docs/plans/2026-08-15-showcase-v1.md`.

## Re-wire `sites/demo` to consume `showcase-kavach`

**Feature:** `docs/features/demo.md` (F1/F2)
**Design:** `docs/design/10-showcase.md` (§5 re-wire follow-up)
**Status:** **Archived** — complete 2026-08-15 (tests 811 green, both
svelte-checks 0 errors, eslint 0 errors, demo build green). See
`docs/plans/2026-08-15-showcase-rewire.md`.

### Next follow-ups

- Re-wire `sites/learn` to consume the kit.
- Generate `sites/demo/kavach.config.js` from kit `demo-config.js` (single
  source for rules/env).
- Per-adapter site deployments + CI (feature F3/F5).

### Completed follow-ups

- F6 density toggle in demo sites — `[data-density]` axis + `DensitySwitcherToggle`
  (2026-08-15).

## Per-adapter demo deployments (F3/F5)

**Feature:** `docs/features/demo.md` (F3, F5)
**Design:** `docs/design/11-demo-deploy.md`
**Status:** 🟡 Scaffold ready — adapter switch, `wrangler.<adapter>.jsonc` x3,
`deploy-demo.sh`, CI workflow, sibling links. **Live deploys pending** the
user's Cloudflare account/DNS + secrets.

### Tasks

| #   | Task                              | Deliverable                                                     | Verify                                    |
| --- | --------------------------------- | --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------- | ----------------------------- |
| 1   | Adapter selection in `sites/demo` | `svelte.config.js` `WORKERS_CI → adapter-cloudflare` + devDeps  | local build still green                   |
| 2   | Per-adapter wrangler configs      | `wrangler.supabase                                              | firebase                                  | convex.jsonc` (Workers Static Assets) | `wrangler deploy -c` dry-runs |
| 3   | Deploy script                     | `sites/showcase/deploy-demo.sh` (build + deploy + domain)       | `SKIP_DEPLOY=1 ./deploy-demo.sh supabase` |
| 4   | CI workflow                       | `.github/workflows/deploy-demos.yml` (workflow_dispatch matrix) | workflow parses                           |
| 5   | F5 sibling links in demo          | "Other demos" sidebar block using `ADAPTERS` + `isLive()`       | demo build green                          |
| 6   | Docs + status                     | `docs/design/11-demo-deploy.md`; feature + dashboard status     | doc links resolve                         |

### Out of scope (follow-ups)

- Actually running `wrangler deploy` (needs credentials/DNS).
- Auth0/Amplify demo sites (blocked on `packages/vite/src/generate.js` auth
  generator supporting those adapters).

### Goal

Stand up `sites/showcase` (`showcase-kavach`): shared Svelte components, shared
config, and the vitest + playwright test setup, without breaking the existing
demo or learn sites. Re-wiring the sites to consume the kit is a follow-up.

### Tasks (in order)

| #   | Task                                 | Deliverable                                                                                                                                                             | Verify                                    |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | Scaffold `sites/showcase` workspace  | `package.json` (`showcase-kavach`), `svelte.config.js`, `tsconfig.json`, `vite.config.js`, `src/index.js` barrel                                                        | `bun install` resolves workspace          |
| 2   | Shared config                        | `src/lib/config/demo-config.js` — `ADAPTERS`, `ROUTES`, `RULES`, `COPY`, `ADAPTER_ENV`                                                                                  | `npm run test:unit`                       |
| 3   | Hacker state                         | `src/lib/state/hacker.svelte.ts` singleton                                                                                                                              | unit tests                                |
| 4   | Port components with token migration | `src/lib/components/*.svelte` — ports of RoleCard, DemoNavItem, SentryConfigPanel, SentryAnnotation, HackerToggle, FloatingBadge, converted `surface-z*` → named tokens | unit tests                                |
| 5   | New `AuthCard`                       | `src/lib/components/AuthCard.svelte`                                                                                                                                    | unit tests                                |
| 6   | Vitest wiring                        | add `showcase` project to `config/vitest.config.js`                                                                                                                     | `test:unit` green                         |
| 7   | Component unit suites                | `src/spec/*.spec.js` (RoleCard, DemoNavItem, AuthCard, SentryConfigPanel, hacker, demo-config)                                                                          | `vitest run` green                        |
| 8   | Move demo e2e into kit               | `sites/showcase/e2e/` — fixtures, globalSetup, per-adapter env, `demo.e2e.ts` (moved from `sites/demo/e2e/`)                                                            | 12/12 green on supabase, firebase, convex |
| 9   | Lint + format                        | zero lint errors across showcase                                                                                                                                        | `npm run lint`                            |

### Out of scope (follow-ups)

- Re-wiring `sites/demo` / `sites/learn` to consume the kit (they currently
  keep their own copies; the kit is proven first).
- Per-adapter site deployments + CI (feature F3/F5).

### Decisions (2026-08-14)

- Tokens migrated to named vocabulary during the port.
- Demo e2e tests move into `sites/showcase/e2e/`.
- Logout is an **internal action**, not a page: the runtime's `handleLogout`
  intercepts `sentry.app.logout` before route protection (mirroring the session
  endpoint). `routes.logout` **defaults to `/logout`** in `packages/vite`
  (`DEFAULTS.routes`), so any app gets server-side logout with no page and no
  config. `routes.data`/`routes.rpc` stay `null` by default — they are enabled
  explicitly (consistent with the "enabled explicitly" intent and CLI's
  `data: ... || null`). The demo no longer ships a `/logout` page; it relies on
  the internal handler (`routes.logout: ROUTES.logout`).
- E2E fixture roles derive from known test email (`admin@test.com` → `admin`), not
  from token claims — GoTrue's token role is always `'authenticated'`.
- Convex e2e seeds via the `users:seed` mutation (health check) from the demo dir;
  the demo's convex-auth exposes no sign-up HTTP route, so no HTTP user creation.
