# Active Plan

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
- F6: density toggle in demo sites.

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
