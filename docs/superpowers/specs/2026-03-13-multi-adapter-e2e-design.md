# Multi-Adapter E2E Testing — Design

## Overview

Add local Firebase emulator and Convex local deployment support to `sites/demo`, then configure Playwright to run the e2e test suite against all three backends (Supabase, Firebase, Convex) using a project-per-adapter setup.

## Problem

`sites/demo` already supports adapter switching via `KAVACH_ADAPTER` env var and has all three adapter packages installed. However:

- The e2e tests are hardcoded to Supabase only
- No Firebase emulator config exists
- No Convex local (`convex/`) directory exists
- Playwright runs a single project on a single port

## Goals

- Each adapter gets a real local backend for tests (no mocks, no cloud)
- `playwright test` runs all three in parallel; `--project=firebase` runs one
- Test bodies are adapter-agnostic — same assertions, different `loginAsUser` implementation per adapter
- Supabase tests continue to work exactly as before

## Out of Scope

- Auth0 and Amplify local testing (no emulators available)
- Making `/demo/[platform]/` routes in `sites/learn` use real per-platform backends
- Production Firebase/Convex deployments

---

## Architecture

```
sites/demo/
  playwright.config.js          ← 3 projects × 3 webServers × 3 ports
  .env.test.supabase             ← KAVACH_ADAPTER=supabase + supabase vars
  .env.test.firebase             ← KAVACH_ADAPTER=firebase + firebase vars
  .env.test.convex               ← KAVACH_ADAPTER=convex + convex vars
  firebase.json                  ← Auth + Firestore emulator config
  .firebaserc                    ← project: demo-kavach
  convex/
    schema.ts                    ← users table (email, role)
    auth.ts                      ← convex-auth password provider
    users.ts                     ← seed mutation
  e2e/
    fixtures.ts                  ← adapter-aware loginAsUser fixture
    demo.e2e.ts                  ← tests import from fixtures, not @playwright/test

adapters/firebase/src/
  adapter.ts                     ← connectAuthEmulator when emulator host env is set
```

---

## Section 1: Local Infrastructure

### Supabase

Already working. No changes needed. Local at `http://127.0.0.1:54321`, seed via `supabase/seed.sql`.

### Firebase Emulator

Add to `sites/demo/`:

**`firebase.json`**

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": false }
  }
}
```

**`.firebaserc`**

```json
{ "projects": { "default": "demo-kavach" } }
```

The `demo-kavach` project ID uses Firebase's `demo-*` convention — works fully offline, no real Firebase project required.

**Firebase adapter change** (`adapters/firebase/src/adapter.ts`):
After `getAuth(app)`, detect `PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` and call `connectAuthEmulator(auth, host)`. Same pattern for Firestore if used. This is the only adapter code change required.

**Test user seeding**: Playwright `globalSetup` calls the Firebase Auth Emulator REST API to create:

- `test@test.com` / `password123` — regular user
- `admin@test.com` / `password123` — admin user (role set via custom claims `{ role: 'admin' }`)

### Convex Local

Add `convex/` directory to `sites/demo/`:

- `schema.ts` — defines the shape of Convex tables needed for auth (`convex-auth` manages its own user tables)
- `auth.ts` — configures `convex-auth` with password + Google providers
- `users.ts` — exposes a `seed` mutation that creates test users

`npx convex dev --local` runs as a subprocess. Local URL is `http://localhost:3210` and goes into `.env.test.convex`.

Playwright `globalSetup` starts `convex dev --local --once` and runs the seed mutation via `npx convex run users:seed`.

---

## Section 2: Env Files

Three files in `sites/demo/`, all gitignored:

**`.env.test.supabase`**

```
KAVACH_ADAPTER=supabase
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

**`.env.test.firebase`**

```
KAVACH_ADAPTER=firebase
PUBLIC_FIREBASE_API_KEY=demo-kavach
PUBLIC_FIREBASE_PROJECT_ID=demo-kavach
PUBLIC_FIREBASE_APP_ID=demo-kavach
PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=http://127.0.0.1:9099
```

**`.env.test.convex`**

```
KAVACH_ADAPTER=convex
PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

An `.env.test.example` documents all keys. The `kavach.config.js` Firebase block gains `authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'` so the vite plugin passes it through.

---

## Section 3: Playwright Multi-Project Config

```js
// sites/demo/playwright.config.js
import { defineConfig } from '@playwright/test'

const adapters = {
  supabase: { port: 4173, envFile: '.env.test.supabase' },
  firebase: { port: 4174, envFile: '.env.test.firebase' },
  convex: { port: 4175, envFile: '.env.test.convex' }
}

export default defineConfig({
  testDir: 'e2e',
  testMatch: /.*\.e2e\.[jt]s/,

  projects: Object.entries(adapters).map(([name, { port }]) => ({
    name,
    use: { baseURL: `http://localhost:${port}` }
  })),

  webServer: Object.entries(adapters).map(([name, { port, envFile }]) => ({
    command: `vite build && vite preview --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    envFile // Playwright 1.46+ supports envFile on webServer
  }))
})
```

Usage:

- `playwright test` — all 3 adapters in parallel
- `playwright test --project=firebase` — Firebase only
- `CI=true playwright test` — forces fresh builds

---

## Section 4: Shared Test Fixtures

```ts
// e2e/fixtures.ts
import { test as base, expect } from '@playwright/test'

type Fixtures = {
  loginAsUser: (role?: 'user' | 'admin') => Promise<void>
}

export const test = base.extend<Fixtures>({
  loginAsUser: async ({ page }, use, testInfo) => {
    await use(async (role = 'user') => {
      const adapter = testInfo.project.name
      const email = role === 'admin' ? 'admin@test.com' : 'test@test.com'
      const password = 'password123'

      switch (adapter) {
        case 'supabase':
          return loginSupabase(page, email, password)
        case 'firebase':
          return loginFirebase(page, email, password)
        case 'convex':
          return loginConvex(page, email, password)
      }
    })
  }
})
export { expect }
```

Each `login*` helper:

1. Calls the respective local backend REST API to get tokens
2. Intercepts `**/auth/session` (prevents client-side SDK from clearing the server-side cookie)
3. Sets the `session` cookie: `{ access_token, refresh_token, user: { id, email, role } }`
4. Navigates to `/dashboard`

**`loginFirebase`**: POST to `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-kavach`, get `idToken` + `refreshToken`. Role resolved from custom claims on the ID token (JWT payload decode, no verification needed in tests).

**`loginConvex`**: POST to the Convex local HTTP endpoint that convex-auth exposes for password sign-in. Returns a JWT + refresh token.

`demo.e2e.ts` switches its import to `./fixtures` and replaces the standalone `loginAsUser` function with the fixture. Test bodies are unchanged.

---

## Implementation Note

The exact session cookie shape for Firebase and Convex must be verified by reading `kavach.handle` during implementation — specifically what it writes after `adapter.synchronize()` returns. The design assumes the same `{ access_token, refresh_token, user }` shape as Supabase; if either adapter uses a different shape, the login helpers will be adjusted accordingly.
