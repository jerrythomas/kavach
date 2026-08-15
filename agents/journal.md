# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

---

## YYYY-MM-DD

### Project Initialized

- Created repository structure
- Set up agent workflow files
- Ready for first design phase

---

## 2026-04-05

### Dynamic home URL resolution (GitHub #17)

**What was done:**

- `routes.home` in `kavach.config.js` now accepts an async function `(session) => string` as well as a static string.
- `processAppRoutes` (sentry) normalises `home` to always be a function. Static strings are wrapped in `() => staticHome` with a `._path` annotation so route rule generation is unaffected.
- `serialize()` (vite) handles functions via `.toString()` so function values survive virtual module generation.
- `handleUnauthorizedAccess` and `handleRouteProtection` (auth) are now async; home is always resolved via `await app.home(session)`. Resolver errors fall back to `'/'`.
- Updated sentry tests to use `expect.any(Function)` for home redirect assertions.
- Added tests: function serialization in vite, dynamic redirect / error fallback in auth middleware.

**Key decision:** home is always a function internally — `homeExclude` was dropped as the resolver function can express the same conditional logic itself.

---

## 2026-03-11

### Fused demo into learn site + deprecated demo/skeleton

**What was done:**

- Removed `sites/demo` and `sites/skeleton` entirely — `sites/learn` is now the single site for docs + demo
- Added kavach client-side context setup in root `+layout.svelte` (proxy pattern with `$state` + `onMount` dynamic import of `$kavach/auth`). Now `AuthProvider` and logout page can access `kavach.signIn/signOut`.
- Fixed auth page (`(public)/auth/+page.svelte`): added `onsuccess` callback → `goto('/demo/supabase')` after successful sign-in; replaced Azure with Google + magic link providers.
- Fixed logout page (`(app)/demo/[platform]/logout/+page.svelte`): calls `kavach.signOut()` then redirects to `/auth`.
- Fixed demo layout server: uses `locals.session?.user` (not `locals.user` which kavach doesn't set).
- Added server-side admin protection: new `+page.server.ts` for admin page redirects non-admin users to `/demo/[platform]`.
- Improved admin page: shows real session info (email, role, user ID).
- Updated data page: real fetch from `/data/[entity]` API with table display.
- Added data API server route (`(server)/data/[...slug]/+server.ts`): returns demo data with role-based filtering (admin-only records hidden from non-admins).
- Updated `kavach.config.js`: corrected route paths to match vite plugin convention.
- Updated homepage "Try Demo" button and nav "Demo" link: both now point to `/demo/supabase`.
- Updated all e2e tests to match new navigation structure and behaviors; rewrote docs tests to use direct URL navigation.
- **45/45 e2e tests pass.**

---

## 2026-03-12

### Story 012 — Per-route fallback config (guardian)

- `findMatchingRoute` in `utils.js` updated to handle `{path, fallback?}` objects alongside plain strings.
- `configureRoleRoutes` stores `{path, fallback}` objects in `restricted` when a fallback is configured.
- `protectRoute` extracts per-route fallback and passes to `getRedirectResponse`.
- `getRedirectResponse` accepts optional `fallback`: numeric → status-only response, string → redirect to that URL.
- 4 new unit tests added covering string fallback (wrong role), string fallback (unauthenticated), numeric fallback as status code, global default when no fallback.
- **561/561 unit tests pass.**

### Story 013 — Demo site enhancements

- **Platform cards**: replaced `<select>` in demo layout nav with a row of platform cards (name + "mock" badge for non-live adapters). Active platform highlighted.
- **Space facts**: replaced posts/users data with astronomy facts. General tier visible to all authenticated users; classified tier (tongue-in-cheek mission briefings) visible to admin only. Server exposes GET/POST/DELETE on `/data/facts`.
- **Role-based write controls**: data page shows "Add Fact" form and "Delete" buttons for admin users only. Non-admin write attempt returns 403 displayed inline.
- **Route protection visualiser**: dashboard replaced with protection card grid — each route shows badge (🔓 Public / 🔑 Authenticated / 👑 Admin only), allowed/denied status for the current user, and an access log feed populated as user navigates.
- **Cached login cards**: auth page reads `getCachedLogins()` via Svelte context on mount and shows recent-account cards above the login form; clicking a card pre-fills the email.
- Updated all e2e tests to match new page titles, nav labels, and removed `selectOption` in favour of clicking the platform card.
- **47/47 e2e tests pass.**

---

## 2026-03-15

### Learn site — demo env vars + remove embedded auth

**Goal:** Wire `sites/learn` so Supabase, Firebase, and Convex demo URLs come from env vars. Remove all embedded Supabase auth from the learn site, making it a pure landing/docs site.

**Design spec:** `docs/superpowers/specs/2026-03-15-learn-demo-env-vars-design.md`
**Plan:** `docs/superpowers/plans/2026-03-15-learn-demo-env-vars.md`

**What was done:**

- Added `sites/learn/.env.example` documenting `PUBLIC_DEMO_SUPABASE_URL`, `PUBLIC_DEMO_FIREBASE_URL`, `PUBLIC_DEMO_CONVEX_URL`
- Created `sites/learn/src/routes/(demo)/demo/+layout.server.ts` — reads env vars via `$env/dynamic/public`, passes as `demoUrls` page data
- Updated `sites/learn/src/lib/demo/platforms.ts` — removed hardcoded URLs, added `getPlatformsWithUrls()` and `getPlatformWithUrl()` helpers that merge env-backed URLs into platform config
- Updated `sites/learn/src/routes/(demo)/demo/+page.svelte` — uses `getPlatformsWithUrls(data.demoUrls)`
- Rewrote `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte` — removed `AuthProvider`, `goto`, `onSuccess`, `prefillTestCredentials`; right panel now shows external launch link for live platforms, "Demo URL not configured" if URL missing, "Coming soon" for inactive platforms
- Deleted `sites/learn/src/routes/(app)/` — embedded dashboard/admin/data/logout routes
- Deleted `sites/learn/src/routes/(server)/data/` — role-based data API (only `data/` subdir; `api/` preserved)
- Deleted `sites/learn/kavach.config.js` and `sites/learn/src/hooks.server.js`
- Removed lingering `$kavach/auth` imports from `+layout@.svelte` and `(public)/+layout.svelte`
- Updated `sites/learn/vite.config.js` — removed `kavach` plugin
- Removed `@kavach/adapter-supabase`, `@kavach/vite`, `@supabase/supabase-js` from `sites/learn/package.json`
- Replaced `sites/learn/e2e/demo.e2e.ts` with new tests: demo landing (5), live platform external links for supabase/firebase/convex (9), coming-soon badges for auth0/amplify (2)
- **626/626 unit tests pass. 46/46 learn e2e tests pass.**

**Commits:**

- `b0221b8` — docs: add learn site demo env vars design spec
- `ca78219` — docs: add learn demo env vars implementation plan
- `1cd35c1` — chore(learn): add .env.example with demo site URL vars
- `bde5e17` — feat(learn): read demo site URLs from env via layout server load
- `85ac2c3` — feat(learn): use env-backed platform URLs on demo landing page
- `d089436` — feat(learn): replace embedded auth form with external demo link on platform page
- `4540b0e` — feat(learn): remove embedded auth routes, hooks, and kavach vite plugin
- `316f4a6` — chore(learn): remove @kavach/adapter-supabase, @kavach/vite, and @supabase/supabase-js deps
- `6b0754e` — test(learn): replace embedded auth e2e tests with demo landing and external link tests

---

## 2026-07-15

### Issue #22 — @kavach/vite generates ambient `.d.ts` for its virtual modules

**Goal:** Stop every SvelteKit consumer from hand-writing an ambient shim for
`$kavach/auth|config|routes|providers`. The plugin now generates the declarations
itself, typed from the real `kavach` types, and writes them where the toolchain
already looks.

**Spec:** `docs/superpowers/specs/2026-07-14-vite-ambient-dts-design.md`
**Plan:** `docs/plans/2026-07-14-vite-ambient-dts.md` (archived)

**What was done:**

- Added pure `generateDeclarations()` in `packages/vite/src/generate.js` — emits
  four `declare module` blocks; reuses `AuthAdapter` from `kavach` and types the
  full `kavach` instance (handle, signIn/Up/Out, onAuthChange, configure, actions,
  cached-login helpers). Content is config-invariant (structural, not literal), so
  its value is auto-placement + lockstep with the JS generators.
- Added `writeDeclarationFile()` (write-if-changed, creates parent dirs) and a new
  `dts?: string | false` option (default `src/kavach.d.ts`). Refactored config
  loading into a memoized `loadConfig()`; emit on both `configResolved` and
  `buildStart`. A failed write now warns via the Vite logger instead of silently
  swallowing (best-effort — never breaks the build).
- Widened `server.fs.allow` to `['/']` for the `vite` project only in
  `config/vitest.config.js` — Vitest 4's SSR runner sandboxes dynamic `import()`
  of the temp `.mjs` config the new tests load from `os.tmpdir()`.

**Validation (sites/demo, real `svelte-check`):**

- Confirmed the generated file removes exactly the 3 `$kavach/*` module-resolution
  errors (`$kavach/auth` ×2, `$kavach/providers`) and introduces none. Remaining
  demo check errors are all pre-existing/unrelated (`Locals.session`,
  `@rokkit/states` decls, `@kavach/ui` `AuthProvider`, `createKavach` `object`
  return, implicit-anys).
- **Timing finding:** `svelte-kit sync` and `svelte-check` do NOT run Vite plugin
  hooks — only `vite dev`/`vite build` generate the file. Documented in the vite
  README; gitignored `src/kavach.d.ts` in the demo.

**Tests/lint:** vite package 17/17; full suite 719/719 green.

**Commits:** `4c579bd` (spec), `a2ea37f`/`3e0eaf8` (plan), `07e0cd7` (Task 1),
`2026859` (Task 2), `c0dd4a8` + `df13ce1` (Task 3), `5ce05f3` (Task 4), docs/close-out.

---

## 2026-07-28

### Release v1.0.0 — first stable

**Goal:** Promote the `1.0.0-next.*` prerelease line to the first stable `1.0.0`.

**What was done:**

- Fast-forwarded `feat/logout-route` (logout-route feature + its `kavach-server.spec.js`,
  commit `3dd067d`) into `develop`.
- Gated on a fully green tree first: **723/723 unit tests pass; lint 0 errors** (62
  pre-existing warnings, acceptable per policy).
- `bun run bump --release 1.0.0 --yes` — bumped all 17 `package.json` files to `1.0.0`,
  committed `chore: release v1.0.0` (`4232780`), tagged `v1.0.0`, and pushed. The tag push
  triggered `.github/workflows/publish.yml`.
- Merged `develop` into `main` (`4211150`) so everything is on `main`, then switched back
  to `develop`. Note: `main` branch protection flags merge commits — the push was bypassed
  (consistent with the prior `-next.38` merge); worth revisiting whether `main` should be
  linear going forward.

**Validation:**

- Publish workflow succeeded (run `30397041533`) — packages + adapters published, GitHub
  release created.
- All 14 npm packages live at `latest=1.0.0`: `kavach`, `@kavach/{cli,cookie,hashing,logger,query,sentry,ui,vite}`,
  `@kavach/adapter-{amplify,auth0,convex,firebase,supabase}`.
- GitHub release `v1.0.0` published (not draft/prerelease).

**Commits:** `3dd067d` (logout feature, via FF to develop), `4232780` (release bump),
`4211150` (merge develop → main). Tag: `v1.0.0`.

---

## 2026-08-03

### Ship AI skills + review agents via @kavach/cli (mirrors rokkit #142)

**Goal:** Give AI coding agents first-class guidance on using the Kavach toolkit — how to
configure it, add a provider, set scopes, change paths, and configure per-role paths/redirects —
and catch consumers who hand-roll auth instead of using the toolkit. Modeled on rokkit's
"library owns its skills/agents + published manifest" pattern.

**What was done:**

- **4 skills** (`packages/cli/skills/<name>/SKILL.md`): `kavach-setup` (config, `@kavach/vite`,
  `$kavach/*` virtual modules, `kavach.handle`, client `createKavach`, changing `routes`),
  `kavach-providers` (providers[], modes, built-ins, scopes, `@kavach/ui` + `$kavach/providers`
  - `kavach.signIn`), `kavach-authorization` (rules[], `public`/`roles`/`fallback`, per-role
    `routes.home` resolver, 401/403 redirect mapping), `kavach-data-access` (`routes.data`/`rpc`,
    query grammar, `+server.ts` re-export override).
- **2 review agents** (`packages/cli/agents/*.md`, Claude subagent format, Mindset/Procedure/
  Verification/Verdict): `kavach-integration-reviewer` and `kavach-authorization-reviewer` —
  each flags hand-rolled auth vs the toolkit and requires real build + flow evidence.
- **Source-verified a docs/code divergence:** the shipped `@kavach/sentry` engine does **not**
  read a rule-level `protected: true` flag (protection comes from `public` defaulting false +
  `roles` defaulting `'*'`) and does **not** consume `roleHome`. Skills teach the wired API
  (`roles: '*'`, `routes.home` resolver, `fallback`) and flag the inert fields.
- **CLI machinery:** ported `packages/cli/src/{skills,agents}.js` (kavach branding, `@clack/prompts`
  with an injectable `promptImpl`), wired `kavach skills list|add` / `kavach agents list|add`
  (`--all` / `--force` / `--remote`) into `src/index.js`, added `skills/**` + `agents/**` to the
  CLI `package.json` `files`.
- **Manifest + publish:** root `sensei.library.json` (skills/agents/llms with git-relative path +
  site-relative url); `sites/learn` `sync:assets` (predev/prebuild) copies skills/agents/llms +
  the manifest into `static/` and `.well-known/`, gitignored the generated copies, added
  `robots.txt` with a `Sensei-Library:` pointer.

**Validation:**

- New specs `packages/cli/spec/{skills,agents,manifest}.spec.js` — **49 passing**. Full suite
  **772/772** (was 723; +49). Lint **0 errors** (complexity/max-lines warnings only, per policy).
- **Real CLI verified** from an unrelated cwd: `kavach skills list` / `agents list` render the
  catalog; `skills add --all` + `agents add <name>` install into `.claude/`; usage line updated.
- `sync:assets` verified to emit `static/{skills,agents,.well-known,sensei.library.json}`.

**Note:** manifest `site` / agents `--remote` base use `https://kavach.sensei-hq.com` — the
confirmed custom domain for the learn Worker (which is otherwise served at `*.workers.dev`).

**Commits:** `ab21086` (feat(cli): skills/agents + sensei.library.json manifest).

### Sync API docs to the wired engine + document UI theming

**Goal:** Fix the docs that diverge from the shipped `@kavach/sentry` engine (the inert
`protected: true` flag and `roleHome` map), keep all API reference docs in sync, and document
the `@kavach/ui` theming override via `data-*` attributes.

**What was done:**

- **Authorization docs → wired API.** Replaced every `protected: true` rule with `roles: '*'`
  and every `roleHome` map with the `routes.home`/`app.home` resolver (+ per-rule `fallback`),
  and corrected the denial redirect mapping (401→login, 403→`unauthorized ?? home`) across:
  `docs/llms/{auth,vite,sentry}.txt`, `packages/auth/README.md`, `packages/sentry/README.md`
  (full rewrite — it had documented an entirely unwired `roles: Record<string, RoleRoute>` map),
  and the learn docs-site source pages `docs/{quick-start,authorization,sentry,configuration,core-concepts}/+page.svelte`.
  Verified 0 residual `protected: true` / `roleHome:` config keys in source docs.
- **UI theming (data-\* attributes).** Documented the real override surface — `@kavach/ui`
  ships no CSS/vars; consumers target rendered `data-*` attributes (`data-auth`,
  `data-auth-provider="<name>"`, `data-auth-mode`, `data-login-card`, `data-provider`,
  `data-passkey`, `data-remove`, `data-auth-page`, `data-other-options`, `data-error`,
  `data-alert`) nested under rokkit's `data-skin`/`data-mode`, with the demo's `app.css` as the
  canonical example. Added Theming sections to `docs/llms/ui.txt`, `packages/ui/README.md`, and
  a §6 in the `kavach-providers` skill (description updated so theming queries trigger it). Also
  fixed the `ui.txt` `mode` prop to include `'oauth'`.
- **Left as-is (flagged):** `docs/design/08-handling.md` describes a fully superseded internal
  interface (`publicRoutes`/`protectedRoutes`/`roleRoutes`/`roleHome`) — a separate rewrite, not
  touched. Archival `docs/superpowers/{plans,specs}/*` are historical records, left unchanged.

**Validation:** full suite **772/772** green after the doc edits; all changed markdown/Svelte
prettier-formatted (Svelte pages parse clean); `sync:assets` re-run so the learn `static/` copies
reflect the corrected docs.

**Commits:** `62d0967` (docs: sync sentry/auth reference + document @kavach/ui theming).

---

## 2026-08-03

### Release v1.0.1 — AI skills/agents + doc sync

**What was done:**

- Gated green (lint 0 errors, 772/772 tests), committed the two chunks on `develop`
  (`ab21086` feat, `62d0967` docs).
- `bun run bump --release 1.0.1 --yes` — bumped all 17 `package.json` to 1.0.1, commit
  `25da549` (`chore: release v1.0.1`), tag `v1.0.1`, pushed (tag push triggered `publish.yml`).
- Merged `develop` → `main` (`f4647aa`, merge commit — `main` protection flags merge commits but
  the push went through, consistent with v1.0.0 / v1.0.0-next.38), then switched back to `develop`.

**Validation (live data):**

- Publish workflow (run `30860781333`) succeeded — packages + adapters published, GitHub release
  `v1.0.1` created (not draft/prerelease).
- npm serves `1.0.1` for `kavach`, `@kavach/{cli,sentry,ui}`, `@kavach/adapter-supabase`, etc.
- Verified the published `@kavach/cli@1.0.1` tarball ships the AI catalog: `skills/` (4) +
  `agents/` (2).

**Note:** `main` branch protection continues to flag the release merge commit (push bypassed).
Worth deciding whether `main` should move to a linear/FF history going forward.

**Commits:** `25da549` (release bump), `f4647aa` (merge develop → main). Tag: `v1.0.1`.

---

## 2026-08-14

### Showcase kit complete — all 3 adapters e2e green (36/36)

**What was done:**

- **Kit + docs** (`sites/showcase`): shared `demo-config.js`, hacker state, token-migrated
  components (RoleCard, DemoNavItem, SentryConfigPanel, SentryAnnotation, HackerToggle,
  FloatingBadge), new `AuthCard`, vitest wiring, and component suites. Full unit suite
  811/811 green. Feature/design/analysis docs written; plan closed (tasks 1–9).
- **E2E moved into kit** and fixed: `e2e/{fixtures,globalSetup,demo.e2e}.ts` + per-adapter
  env files; the demo's own e2e/playwright config/scripts were removed.
- **Root-caused the 6 failing supabase e2e** (data interception, logout interception,
  admin role) and fixed by stopping kavach from shadowing the demo's own routes:
  - `packages/vite/src/config.js` DEFAULTS: `routes.data`/`routes.rpc`/`routes.logout` → `null`
    (matches the "enabled explicitly" intent + CLI's `data: ... || null`).
  - `packages/auth/src/kavach.js` `getAgents` now merges `logout` symmetrically with
    `data`/`rpc` — an unregistered logout resolves to `undefined`, disabling `handleLogout`'s
    303 → login.
  - `sites/demo/kavach.config.js` drops `data`/`logout` routes (the demo keeps its own
    logout page and SEED_FACTS data endpoint) and adds an explicit `/logout` rule.
  - `sites/showcase/e2e/fixtures.ts` `loginSupabase` derives role from known test email
    (`admin@test.com` → `admin`) — GoTrue token roles are always `'authenticated'`.
  - `packages/sentry/src/processor.js` `getAuthorizedRoutes` is now null-safe on
    `config.protected['*']` — surfaced when no auto-rules exist (unregistered app routes).
  - `sites/showcase/e2e/globalSetup.ts` convex seed now runs `convex run users:seed` from
    the demo dir (convex binary lives there) and drops the dead convex-auth HTTP sign-up loop.

**Validation:** vitest 811/811; Playwright 12/12 on supabase (:4173), firebase (:4174),
convex (:4175) — 36 e2e total; eslint 0 errors; prettier clean. Supabase emulator on 54321,
firebase emulators on 9099/8080, convex local backend on 3210.

**Out of scope:** re-wiring the sites to consume the kit; per-adapter deployments + CI.

### Dependency upgrades + zero-error sweep (rokkit 1.3.7, firebase 12, convex-auth 0.0.95)

**What was done:**

- **Dependency bumps** (all manifests + `bun install`): `@rokkit/*` `1.0.0-next.145` →
  `1.3.7` (root, demo, learn, showcase) and `packages/ui` `@rokkit/forms` same; firebase
  `^11.0.0` → `^12.0.0` (adapters/firebase) and `^10.14.1` → `^12.0.0` (demo);
  `@convex-dev/auth` `^0.0.80` → `^0.0.95` (adapters/convex) and `^0.0.91` → `^0.0.95` (demo).
- **A/B baseline verified** (stash/unstash): the rokkit bump introduced zero new svelte-check
  errors — demo 24→12, learn 16→5, all pre-existing. Only snapshot change was rokkit 1.3.7's
  additive `data-field-layout="stacked"` attribute (8 snapshots regenerated).
- **Lint 621 errors → 0**: root flat-config (`eslint.config.js`, untracked) ignores
  `docs/mockups/**` (618 errors in generated React bundles); fixed 3 real showcase errors
  (`{#each}` key, unused `setContext` import, `require-await`).
- **Showcase vitest fixed**: added `$app/stores` → `src/spec/mocks/app-stores.js` alias in
  `sites/showcase/vite.config.js`, scoped to `mode === 'test'` so the real app still gets the
  SvelteKit virtual store. 39/39 green.
- **Demo svelte-check 12 → 0**: structured JSDoc return type for `createKavach`
  (`packages/auth/src/kavach.js`, rebuilt dist); JSDoc types in `DemoNavItem.svelte`,
  `FloatingBadge.svelte`, `data/+page.svelte`; new `sites/demo/src/app.d.ts` declaring
  `App.Locals.session?: AuthSession | null`; fixed `@kavach/ui` typing durably — replaced
  the broken tsc d.ts build (which emitted `export {};`) with `svelte2tsx`'s `emitDts`
  (`packages/ui/scripts/generate-dts.mjs`, devDep `svelte2tsx`, `jsx: preserve` in
  tsconfig.build.json) so `dist/index.d.ts` is generated from the `.svelte` sources on every
  build. Also fixed the source JSDoc typedefs the generator exposed as inaccurate
  (`AuthProvider` `result` was not a prop; defaulted props were marked required) and the
  broken `import('../types).Provider[]` refs in `AuthGroup`/`AuthHandler`. Tightened the
  `$kavach/providers` ambient type in `packages/vite/src/generate.js` to the real
  `AuthProvider` contract (`mode?: 'otp' | 'oauth' | 'password'; label: string`).
- **`kavach.d.ts` generation made deterministic**: `sites/demo/src/kavach.d.ts` (gitignored,
  emitted by the vite plugin on `configResolved`/`buildStart`) is NOT regenerated by
  `svelte-kit sync`, so a fresh checkout broke `bun run check`. Added a first-class generator
  `packages/vite/scripts/generate-dts.mjs` (reuses `generateDeclarations` +
  `writeDeclarationFile`, `scripts/**/*.mjs` added to `files` + exports subpath
  `./scripts/generate-dts.mjs`), and wired it into the demo's `check`:
  `bun node_modules/@kavach/vite/scripts/generate-dts.mjs && svelte-kit sync && svelte-check`.
  Verified the fresh-checkout path: deleted the file, `bun run check` regenerates it (with
  the tightened `$kavach/providers` type) and passes 0/0.
- **Learn svelte-check 5 → 0**: JSDoc `@param` on `rand`, `$page.params.platform ?? ''`,
  `TableOfContents` instance type on `toc`.
- **Zero-errors policy**: lint 0 errors (69 pre-existing warnings), vitest 811/811 via
  `config/vitest.config.js` (`bun run test:ci` — plain `bun vitest run` breaks localStorage
  env and scans `.worktrees/**`), build:all clean, demo + learn svelte-check 0 errors.

**Out of scope:** committing/unstaging the bump manifests; showcase `bun run check` (no
svelte-check script wired in the kit); remaining learn warnings (2, pre-existing).
