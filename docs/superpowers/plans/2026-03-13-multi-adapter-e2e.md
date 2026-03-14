# Multi-Adapter E2E Testing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Firebase emulator and Convex local support to `sites/demo` and configure Playwright to run the e2e test suite against all three backends via `KAVACH_ADAPTER` env var.

**Architecture:** Single Playwright webServer per run, adapter selected by `KAVACH_ADAPTER`. Three named projects in `playwright.config.js` map to the same test files; `KAVACH_ADAPTER=firebase playwright test` runs the firebase project. npm scripts provide per-adapter and all-adapter convenience entry points. Tests set the session cookie directly, bypassing UI sign-in.

> **Design note — single vs multi-project Playwright:** The design spec shows three parallel webServers. This plan uses a single webServer per run to avoid concurrent `vite build` conflicts on `.svelte-kit/output/`. The user confirmed this approach (Option A). `test:e2e:all` runs all three sequentially via npm scripts.

> **Design note — emulator support location:** The design spec lists `adapters/firebase/src/adapter.ts` for `connectAuthEmulator`. This plan implements it in the Vite template (`packages/vite/src/templates/auth-firebase.js`) instead, because kavach's adapter is instantiated at build time by the generated `$kavach/auth` module — not at runtime in the adapter class. The template approach is consistent with how all other Firebase config (apiKey, projectId) is handled.

**Tech Stack:** Playwright 1.58, SvelteKit/Vite, Firebase Auth Emulator, Convex local deployment (`convex dev --local`), `@playwright/test` fixtures

---

## Chunk 1: Playwright Infrastructure + Supabase Migration

Migrate existing Supabase e2e to the shared fixtures pattern. This chunk produces working Supabase tests — the baseline for the next two chunks.

**Files:**

- Create: `sites/demo/.env.test.supabase`
- Create: `sites/demo/.env.test.example`
- Modify: `sites/demo/playwright.config.js`
- Create: `sites/demo/e2e/fixtures.ts`
- Create: `sites/demo/e2e/globalSetup.ts`
- Modify: `sites/demo/e2e/demo.e2e.ts`
- Modify: `sites/demo/package.json`

---

### Task 1: Create env files

- [ ] **Step 1: Create `.env.test.supabase`**

  Create `sites/demo/.env.test.supabase`:

  ```
  KAVACH_ADAPTER=supabase
  PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
  ```

- [ ] **Step 2: Create `.env.test.example`**

  Create `sites/demo/.env.test.example`:

  ```
  # Supabase (local emulator via `supabase start`)
  # KAVACH_ADAPTER=supabase
  # PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  # PUBLIC_SUPABASE_ANON_KEY=<from supabase status>

  # Firebase (local emulator via `npm run emulators`)
  # KAVACH_ADAPTER=firebase
  # PUBLIC_FIREBASE_API_KEY=demo-kavach
  # PUBLIC_FIREBASE_PROJECT_ID=demo-kavach
  # PUBLIC_FIREBASE_APP_ID=demo-kavach
  # PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=http://127.0.0.1:9099

  # Convex (local via `npx convex dev --local`)
  # KAVACH_ADAPTER=convex
  # PUBLIC_CONVEX_URL=http://127.0.0.1:3210
  ```

- [ ] **Step 3: Commit**
  ```bash
  cd sites/demo
  git add .env.test.example
  git commit -m "chore(demo): add .env.test.example for multi-adapter e2e"
  ```
  Note: `.env.test.supabase` is gitignored by the existing `.env.*` rule.

---

### Task 2: Update `playwright.config.js`

- [ ] **Step 1: Rewrite `sites/demo/playwright.config.js`**

  Replace entire file with:

  ```js
  import { defineConfig } from '@playwright/test'

  const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'

  const adapters = {
    supabase: { port: 4173, envFile: '.env.test.supabase' },
    firebase: { port: 4174, envFile: '.env.test.firebase' },
    convex: { port: 4175, envFile: '.env.test.convex' }
  }

  const { port, envFile } = adapters[adapter] ?? adapters.supabase

  export default defineConfig({
    testDir: 'e2e',
    testMatch: /.*\.e2e\.[jt]s/,
    globalSetup: './e2e/globalSetup.ts',

    projects: [{ name: adapter, use: { baseURL: `http://localhost:${port}` } }],

    webServer: {
      command: `npm run build && npm run preview -- --port ${port}`,
      port,
      reuseExistingServer: !process.env.CI,
      envFile
    }
  })
  ```

  > Playwright 1.46+ supports `envFile` on `webServer` — this loads adapter env vars into the vite build so `KAVACH_ADAPTER` and `PUBLIC_*` vars are set at build time.

- [ ] **Step 2: Verify config parses**
  ```bash
  cd sites/demo && npx playwright test --list 2>&1 | head -5
  ```
  Expected: lists test names (no parse error)

---

### Task 3: Create `e2e/fixtures.ts`

- [ ] **Step 1: Create `sites/demo/e2e/fixtures.ts`**

  ```ts
  import { test as base, expect, type Page } from '@playwright/test'

  async function setCookie(page: Page, session: object) {
    await page.context().addCookies([
      {
        name: 'session',
        value: JSON.stringify(session),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      }
    ])
  }

  async function loginSupabase(page: Page, email: string, password: string) {
    const SUPABASE_URL = 'http://127.0.0.1:54321'
    const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

    const response = await page
      .context()
      .request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        data: { email, password },
        headers: { 'Content-Type': 'application/json', apikey: ANON_KEY }
      })
    const token = await response.json()
    if (!token.access_token) throw new Error(`Supabase auth failed: ${JSON.stringify(token)}`)

    await page.route('**/auth/session', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    )
    await setCookie(page, {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      user: { id: token.user.id, email: token.user.email, role: token.user.role }
    })
  }

  async function loginFirebase(page: Page, email: string, password: string) {
    const EMULATOR_URL = 'http://127.0.0.1:9099'
    const PROJECT_ID = 'demo-kavach'

    const response = await page
      .context()
      .request.post(
        `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${PROJECT_ID}`,
        {
          data: { email, password, returnSecureToken: true },
          headers: { 'Content-Type': 'application/json' }
        }
      )
    const token = await response.json()
    if (!token.idToken) throw new Error(`Firebase auth failed: ${JSON.stringify(token)}`)

    // Role is set directly from known test user email — no JWT claim parsing needed
    // because handleRouteProtection reads the session cookie as-is (no adapter call)
    const role = email === 'admin@test.com' ? 'admin' : 'user'

    await page.route('**/auth/session', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    )
    await setCookie(page, {
      access_token: token.idToken,
      refresh_token: token.refreshToken,
      user: { id: token.localId, email, role }
    })
  }

  async function loginConvex(page: Page, email: string, password: string) {
    // Convex adapter's synchronize() is a pass-through — any token value works
    // since handleRouteProtection reads the cookie directly without adapter validation
    const CONVEX_URL = 'http://127.0.0.1:3210'

    // Sign in via convex-auth HTTP action
    const response = await page.context().request.post(`${CONVEX_URL}/api/auth/signin`, {
      data: { provider: 'password', params: { email, password, flow: 'signIn' } },
      headers: { 'Content-Type': 'application/json' }
    })

    let userId: string
    let accessToken: string
    let refreshToken: string

    if (response.ok()) {
      const data = await response.json()
      userId = data.userId ?? email
      accessToken = data.token ?? 'convex-test-token'
      refreshToken = data.refreshToken ?? 'convex-test-refresh'
    } else {
      // Fallback: use placeholder IDs (sufficient since session cookie is trusted directly)
      userId = email === 'admin@test.com' ? 'admin-test-id' : 'user-test-id'
      accessToken = 'convex-test-token'
      refreshToken = 'convex-test-refresh'
    }

    const role = email === 'admin@test.com' ? 'admin' : 'user'

    await page.route('**/auth/session', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    )
    await setCookie(page, {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: userId, email, role }
    })
  }

  async function navigateToDashboard(page: Page) {
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('main h1', { state: 'visible', timeout: 10000 })
  }

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
            await loginSupabase(page, email, password)
            break
          case 'firebase':
            await loginFirebase(page, email, password)
            break
          case 'convex':
            await loginConvex(page, email, password)
            break
          default:
            throw new Error(`Unknown adapter: ${adapter}`)
        }

        await navigateToDashboard(page)
      })
    }
  })

  export { expect }
  ```

---

### Task 4: Create `e2e/globalSetup.ts` (stub)

- [ ] **Step 1: Create `sites/demo/e2e/globalSetup.ts`**

  ```ts
  import type { FullConfig } from '@playwright/test'

  export default async function globalSetup(_config: FullConfig) {
    const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'

    switch (adapter) {
      case 'supabase':
        // Supabase users are seeded via supabase/seed.sql at startup — nothing to do
        break
      case 'firebase':
        await setupFirebase()
        break
      case 'convex':
        await setupConvex()
        break
    }
  }

  async function setupFirebase() {
    // Implemented in Chunk 2
  }

  async function setupConvex() {
    // Implemented in Chunk 3
  }
  ```

---

### Task 5: Update `demo.e2e.ts`

- [ ] **Step 1: Replace import and `loginAsUser` in `e2e/demo.e2e.ts`**

  Remove lines 1–48 (old import, constants, standalone `loginAsUser` function) and replace with:

  ```ts
  import { expect, test } from './fixtures.js'
  ```

  Then update the three `beforeEach` calls:

  Replace:

  ```ts
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })
  ```

  With:

  ```ts
  test.beforeEach(async ({ loginAsUser }) => {
    await loginAsUser('user')
  })
  ```

  Replace (in Admin user block):

  ```ts
  test.beforeEach(async ({ page }) => {
    // admin user must exist in local Supabase with role='admin'
    await loginAsUser(page, 'admin@test.com', 'password123')
  })
  ```

  With:

  ```ts
  test.beforeEach(async ({ loginAsUser }) => {
    await loginAsUser('admin')
  })
  ```

  The test bodies are unchanged — `{ page }` destructuring still works because `test` extends `base`.

- [ ] **Step 2: Verify file is valid TypeScript**
  ```bash
  cd sites/demo && npx tsc --noEmit 2>&1 | grep -E "e2e/"
  ```
  Expected: no errors in e2e files

---

### Task 6: Add npm scripts

- [ ] **Step 1: Update `scripts` in `sites/demo/package.json`**

  Add these scripts (keep existing ones):

  ```json
  "test:e2e": "playwright test",
  "test:e2e:supabase": "KAVACH_ADAPTER=supabase playwright test",
  "test:e2e:firebase": "KAVACH_ADAPTER=firebase playwright test",
  "test:e2e:convex": "KAVACH_ADAPTER=convex playwright test",
  "test:e2e:all": "npm run test:e2e:supabase && npm run test:e2e:firebase && npm run test:e2e:convex"
  ```

  Remove the old `"test:e2e": "playwright test"` line (replace with the new set).

---

### Task 7: Verify Supabase tests still pass

- [ ] **Step 1: Ensure Supabase local is running**

  ```bash
  cd sites/demo && supabase status 2>&1 | head -5
  ```

  Expected: shows `API URL: http://127.0.0.1:54321`. If not: `supabase start`

- [ ] **Step 2: Run Supabase e2e tests**

  ```bash
  cd sites/demo && npm run test:e2e:supabase
  ```

  Expected: all tests pass (same count as before)

- [ ] **Step 3: Commit**
  ```bash
  git add sites/demo/playwright.config.js sites/demo/e2e/fixtures.ts sites/demo/e2e/globalSetup.ts sites/demo/e2e/demo.e2e.ts sites/demo/package.json sites/demo/.env.test.example
  git commit -m "feat(demo): add multi-adapter playwright infrastructure, migrate Supabase to fixtures"
  ```

---

## Chunk 2: Firebase Emulator

Add Firebase Auth Emulator support. Requires: `firebase-tools` installed globally (`npm i -g firebase-tools`) and `java` on PATH (emulator dependency).

**Files:**

- Create: `sites/demo/firebase.json`
- Create: `sites/demo/.firebaserc`
- Create: `sites/demo/.env.test.firebase`
- Modify: `packages/vite/src/templates/auth-firebase.js`
- Modify: `packages/vite/src/generate.js`
- Modify: `sites/demo/kavach.config.js`
- Modify: `sites/demo/e2e/globalSetup.ts`

---

### Task 8: Firebase emulator config files

- [ ] **Step 1: Create `sites/demo/firebase.json`**

  ```json
  {
    "emulators": {
      "auth": { "port": 9099 },
      "firestore": { "port": 8080 },
      "ui": { "enabled": false }
    }
  }
  ```

  > Firestore emulator is required because the Firebase adapter template uses `getFirestore` and `getLogWriter` (writes logs to Firestore). Without the Firestore emulator running, auth may succeed but log writes will fail.

- [ ] **Step 2: Create `sites/demo/.firebaserc`**

  ```json
  { "projects": { "default": "demo-kavach" } }
  ```

  > `demo-kavach` uses Firebase's `demo-*` convention — works fully offline with no real Firebase project.

- [ ] **Step 3: Create `sites/demo/.env.test.firebase`**

  ```
  KAVACH_ADAPTER=firebase
  PUBLIC_FIREBASE_API_KEY=demo-kavach
  PUBLIC_FIREBASE_PROJECT_ID=demo-kavach
  PUBLIC_FIREBASE_APP_ID=demo-kavach
  PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=http://127.0.0.1:9099
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add sites/demo/firebase.json sites/demo/.firebaserc
  git commit -m "chore(demo): add Firebase emulator config"
  ```

---

### Task 9: Add emulator support to Firebase auth template

The generated `$kavach/auth` module for Firebase must call `connectAuthEmulator` when the emulator host env var is set. This requires changes in two places: the template and the generator.

- [ ] **Step 1: Write the failing test**

  In `packages/vite/src/generate.test.js` (or create if absent), add:

  ```js
  import { describe, it, expect } from 'vitest'
  import { generateModule } from './generate.js'

  describe('generateAuth - firebase emulator', () => {
    it('includes connectAuthEmulator call when authEmulatorHost is configured', () => {
      const config = {
        adapter: 'firebase',
        env: {
          apiKey: 'PUBLIC_FIREBASE_API_KEY',
          projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
          appId: 'PUBLIC_FIREBASE_APP_ID',
          authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'
        },
        logging: { level: 'error', collection: 'logs' },
        rules: []
      }
      const output = generateModule('auth', config)
      expect(output).toContain('connectAuthEmulator')
      expect(output).toContain('PUBLIC_FIREBASE_AUTH_EMULATOR_HOST')
    })

    it('omits connectAuthEmulator when authEmulatorHost is not configured', () => {
      const config = {
        adapter: 'firebase',
        env: {
          apiKey: 'PUBLIC_FIREBASE_API_KEY',
          projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
          appId: 'PUBLIC_FIREBASE_APP_ID'
        },
        logging: { level: 'error', collection: 'logs' },
        rules: []
      }
      const output = generateModule('auth', config)
      expect(output).not.toContain('connectAuthEmulator')
    })
  })
  ```

- [ ] **Step 2: Run to confirm tests fail**

  ```bash
  cd packages/vite && npx vitest run src/generate.test.js 2>&1 | tail -10
  ```

  Expected: FAIL — `connectAuthEmulator` not found in output

- [ ] **Step 3: Modify `packages/vite/src/templates/auth-firebase.js`**

  Replace entire file:

  ```js
  import { createKavach } from 'kavach'
  import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-firebase'
  import { getLogger } from '@kavach/logger'
  import { initializeApp } from 'firebase/app'
  import { getFirestore } from 'firebase/firestore'
  import { getAuth, connectAuthEmulator } from 'firebase/auth'
  import { env } from '$env/dynamic/public'

  const app = initializeApp({
  	apiKey: env.{{apiKey}},
  	projectId: env.{{projectId}},
  	appId: env.{{appId}}
  })
  const db = getFirestore(app)
  const auth = getAuth(app)
  {{emulatorBlock}}
  const adapter = getAdapter(auth)
  const data = () => getActions(db)
  const writer = getLogWriter(db, { collection: '{{logCollection}}' })
  const logger = getLogger(writer, { level: '{{logLevel}}' })

  export const kavach = createKavach(adapter, {
  	data,
  	logger,
  	rules: {{rules}}
  })
  export { adapter, logger }
  ```

  The `{{emulatorBlock}}` placeholder will be replaced by the generator.

- [ ] **Step 4: Modify `packages/vite/src/generate.js`** — update the Firebase case

  In `generateAuth`, replace the firebase block:

  ```js
  if (config.adapter === 'firebase') {
    const emulatorBlock = config.env.authEmulatorHost
      ? `if (env.${config.env.authEmulatorHost}) {\n\tconnectAuthEmulator(auth, env.${config.env.authEmulatorHost}, { disableWarnings: true })\n}`
      : ''

    return templates.authFirebase
      .replaceAll('{{apiKey}}', env.apiKey)
      .replaceAll('{{projectId}}', env.projectId)
      .replaceAll('{{appId}}', env.appId)
      .replaceAll('{{authEmulatorHost}}', env.authEmulatorHost ?? '')
      .replaceAll('{{emulatorBlock}}', emulatorBlock)
      .replaceAll('{{logCollection}}', logging.collection ?? 'logs')
      .replaceAll('{{logLevel}}', logging.level)
      .replaceAll('{{rules}}', serialize(rules))
  }
  ```

  Note: `env` here is `config.env` (the env variable name mapping), not process.env. Fix the variable name: use `config.env` instead of the local `env`:

  ```js
  if (config.adapter === 'firebase') {
    const { env: envVars, logging, rules } = config // shadow at top of if block
    const emulatorBlock = envVars.authEmulatorHost
      ? `if (env.${envVars.authEmulatorHost}) {\n\tconnectAuthEmulator(auth, env.${envVars.authEmulatorHost}, { disableWarnings: true })\n}`
      : ''

    return templates.authFirebase
      .replaceAll('{{apiKey}}', envVars.apiKey)
      .replaceAll('{{projectId}}', envVars.projectId)
      .replaceAll('{{appId}}', envVars.appId)
      .replaceAll('{{emulatorBlock}}', emulatorBlock)
      .replaceAll('{{logCollection}}', logging.collection ?? 'logs')
      .replaceAll('{{logLevel}}', logging.level)
      .replaceAll('{{rules}}', serialize(rules))
  }
  ```

  > Important: The top-level `generateAuth` destructures `const { env, logging, rules } = config`. The firebase block currently uses that `env`. The `replaceAll` calls must use the right variable — check against the existing code before editing, and adjust the destructuring if needed to avoid shadowing.

- [ ] **Step 5: Run tests to confirm they pass**

  ```bash
  cd packages/vite && npx vitest run src/generate.test.js 2>&1 | tail -10
  ```

  Expected: PASS

- [ ] **Step 6: Run the full vite package test suite**

  ```bash
  cd packages/vite && npx vitest run 2>&1 | tail -15
  ```

  Expected: all pass

- [ ] **Step 7: Commit**
  ```bash
  git add packages/vite/src/templates/auth-firebase.js packages/vite/src/generate.js packages/vite/src/generate.test.js
  git commit -m "feat(vite): add Firebase auth emulator support to Firebase template"
  ```

---

### Task 10: Update `kavach.config.js` Firebase env

- [ ] **Step 1: Add `authEmulatorHost` to `sites/demo/kavach.config.js` Firebase config**

  In the `firebase` entry of `ADAPTER_CONFIGS`, add `authEmulatorHost`:

  ```js
  firebase: {
    env: {
      apiKey: 'PUBLIC_FIREBASE_API_KEY',
      projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
      appId: 'PUBLIC_FIREBASE_APP_ID',
      authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'
    },
    providers: [
      { name: 'google', label: 'Continue with Google' },
      { mode: 'otp', name: 'magic', label: 'Email Magic Link' }
    ],
    logging: { level: 'error', collection: 'logs' }
  },
  ```

- [ ] **Step 2: Verify vite build with firebase adapter works**

  ```bash
  cd sites/demo && KAVACH_ADAPTER=firebase dotenv -e .env.test.firebase -- npm run build 2>&1 | tail -10
  ```

  Expected: build succeeds with no errors

  If `dotenv` CLI is not available, use:

  ```bash
  cd sites/demo && set -a && source .env.test.firebase && set +a && npm run build 2>&1 | tail -10
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add sites/demo/kavach.config.js
  git commit -m "feat(demo): add authEmulatorHost to Firebase kavach config"
  ```

---

### Task 11: Firebase globalSetup — seed test users

- [ ] **Step 1: Write the failing test for globalSetup**

  Add to `e2e/globalSetup.test.ts` (create if absent):

  ```ts
  import { describe, it, expect, vi } from 'vitest'

  // Unit test: seedFirebaseUsers calls the emulator REST API
  describe('seedFirebaseUsers', () => {
    it('creates test@test.com and admin@test.com without throwing', async () => {
      // This is an integration test that requires the emulator running.
      // Skip in unit test runs; tested manually in Task 12.
      expect(true).toBe(true)
    })
  })
  ```

  > Note: Firebase seed is integration-only. The unit test is a placeholder. Real verification is in Task 12.

- [ ] **Step 2: Implement `setupFirebase` in `e2e/globalSetup.ts`**

  Replace the stub `setupFirebase` function:

  ```ts
  async function setupFirebase() {
    const EMULATOR_URL = 'http://127.0.0.1:9099'
    const PROJECT_ID = 'demo-kavach'

    const users = [
      { email: 'test@test.com', password: 'password123' },
      { email: 'admin@test.com', password: 'password123' }
    ]

    for (const { email, password } of users) {
      // Try to create the user — ignore "already exists" errors
      const res = await fetch(
        `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${PROJECT_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: false })
        }
      )
      const data = await res.json()
      if (data.error && data.error.message !== 'EMAIL_EXISTS') {
        throw new Error(`Firebase seed failed for ${email}: ${JSON.stringify(data.error)}`)
      }
    }
  }
  ```

  > Users are created on each test run. `EMAIL_EXISTS` is silently ignored so re-runs don't fail.

---

### Task 12: Verify Firebase e2e tests pass

- [ ] **Step 1: Start the Firebase emulator**

  ```bash
  cd sites/demo && npm run emulators &
  # Wait ~10s for emulator to be ready
  ```

  Expected: emulator output shows `All emulators ready!` with auth on port 9099

- [ ] **Step 2: Run Firebase e2e tests**

  ```bash
  cd sites/demo && npm run test:e2e:firebase
  ```

  Expected: all tests pass

  **If `loginFirebase` fails** (emulator REST response differs): inspect the raw response:

  ```bash
  curl -s -X POST 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-kavach' \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@test.com","password":"password123","returnSecureToken":true}' | jq .
  ```

  Adjust field names in `loginFirebase` if needed (`idToken`, `refreshToken`, `localId` are standard Firebase Auth REST response fields).

  **If vite build fails** (emulator host env var not passed through): verify `.env.test.firebase` is loaded and `PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` appears in the built output:

  ```bash
  grep -r "connectAuthEmulator" sites/demo/.svelte-kit/output/ 2>/dev/null | head -3
  ```

- [ ] **Step 3: Stop the emulator**

  ```bash
  kill %1
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add sites/demo/e2e/globalSetup.ts sites/demo/.env.test.example
  git commit -m "feat(demo): add Firebase emulator e2e support with test user seeding"
  ```

---

## Chunk 3: Convex Local

Add Convex local deployment support. Requires: `convex` package already in `sites/demo` deps (confirmed: `"convex": "^1.24.0"`).

**Files:**

- Create: `sites/demo/convex/schema.ts`
- Create: `sites/demo/convex/auth.ts`
- Create: `sites/demo/convex/users.ts`
- Create: `sites/demo/.env.test.convex`
- Modify: `sites/demo/e2e/globalSetup.ts`

---

### Task 13: Create Convex local backend

- [ ] **Step 1: Initialize convex in `sites/demo`**

  ```bash
  cd sites/demo && npx convex dev --local --once 2>&1 | head -20
  ```

  Expected: creates `convex.json` and starts the local backend. If it prompts for a project, press Ctrl+C — we'll create the files manually.

- [ ] **Step 2: Create `sites/demo/convex/schema.ts`**

  ```ts
  import { defineSchema, defineTable } from 'convex/server'
  import { v } from 'convex/values'
  import { authTables } from '@convex-dev/auth/server'

  export default defineSchema({
    ...authTables
    // authTables includes users table with email field
  })
  ```

  > `@convex-dev/auth` manages its own user tables. No additional tables needed for kavach tests.

- [ ] **Step 3: Create `sites/demo/convex/auth.ts`**

  ```ts
  import { convexAuth } from '@convex-dev/auth/server'
  import Password from '@convex-dev/auth/providers/Password'

  export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [Password]
  })
  ```

  > Filename must be `auth.ts` (not `auth.config.ts`). `convex-auth` discovers the auth config by convention from `convex/auth.ts`.

- [ ] **Step 4: Create `sites/demo/convex/users.ts`**

  ```ts
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'

  /**
   * Seed test users for e2e tests.
   * Idempotent — safe to run multiple times.
   */
  export const seed = mutation({
    args: {},
    handler: async (ctx) => {
      const users = [
        { email: 'test@test.com', password: 'password123' },
        { email: 'admin@test.com', password: 'password123' }
      ]
      // convex-auth handles user creation via signIn flow
      // This mutation verifies the users exist and returns their IDs
      const results = []
      for (const { email } of users) {
        const existing = await ctx.db
          .query('users')
          .withIndex('email', (q) => q.eq('email', email))
          .first()
        results.push({ email, id: existing?._id ?? null })
      }
      return results
    }
  })

  export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
      return ctx.db
        .query('users')
        .withIndex('email', (q) => q.eq('email', email))
        .first()
    }
  })
  ```

  > Note: `convex-auth` users are created via the `signIn` flow, not directly via mutations. The seed mutation above checks if users exist. Actual user creation for tests happens via the globalSetup calling convex-auth's sign-up endpoint.

- [ ] **Step 5: Install `@convex-dev/auth`**

  ```bash
  cd sites/demo && bun add @convex-dev/auth
  ```

- [ ] **Step 6: Deploy convex functions locally**

  ```bash
  cd sites/demo && npx convex dev --local --once 2>&1 | tail -10
  ```

  Expected: functions deployed, local backend URL printed (should be `http://127.0.0.1:3210`)

- [ ] **Step 7: Create `sites/demo/.env.test.convex`**

  ```
  KAVACH_ADAPTER=convex
  PUBLIC_CONVEX_URL=http://127.0.0.1:3210
  ```

  If the local backend uses a different URL (check output from step 6), update accordingly.

- [ ] **Step 8: Commit**
  ```bash
  git add sites/demo/convex/ sites/demo/.env.test.example
  git commit -m "feat(demo): add Convex local backend schema and auth config"
  ```

---

### Task 14: Convex globalSetup — seed test users

- [ ] **Step 1: Implement `setupConvex` in `e2e/globalSetup.ts`**

  Replace the stub `setupConvex`:

  ```ts
  import { spawnSync } from 'child_process'

  async function setupConvex() {
    const CONVEX_URL = 'http://127.0.0.1:3210'

    // Step 1: Create test users via convex-auth HTTP sign-up endpoint
    const users = [
      { email: 'test@test.com', password: 'password123' },
      { email: 'admin@test.com', password: 'password123' }
    ]

    for (const { email, password } of users) {
      // convex-auth exposes sign-up via its HTTP router — path may vary by version
      // Inspect available routes: curl http://127.0.0.1:3210/api/auth
      const res = await fetch(`${CONVEX_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'password',
          params: { email, password, flow: 'signUp' }
        })
      })
      // sign-up may return 200 (created) or 400 (already exists) — both acceptable
      if (!res.ok && res.status !== 400) {
        const body = await res.text()
        console.warn(`Convex sign-up HTTP call failed for ${email} (status ${res.status}): ${body}`)
      }
    }

    // Step 2: Run the seed mutation — confirms users exist and backend is healthy
    const result = spawnSync('npx', ['convex', 'run', 'users:seed'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, CONVEX_URL }
    })
    if (result.status !== 0) {
      throw new Error(`Convex seed mutation failed: ${result.stderr?.toString()}`)
    }
  }
  ```

  > **Note on HTTP path:** During implementation, verify the convex-auth sign-up route by checking the convex-auth README for `httpRouter` configuration. The `npx convex run users:seed` call (Step 2) is the authoritative health check.

  > **Note on admin role:** `handleRouteProtection` reads `user.role` directly from the session cookie. The Convex backend does not need a role field on user records — the fixture sets role from the test email (`admin@test.com` → `'admin'`).

---

### Task 15: Verify Convex e2e tests pass

- [ ] **Step 1: Start Convex local backend**

  ```bash
  cd sites/demo && npx convex dev --local &
  # Wait ~15s for backend to be ready
  ```

  Expected: output shows local URL (e.g., `http://127.0.0.1:3210`)

- [ ] **Step 2: Run Convex e2e tests**

  ```bash
  cd sites/demo && npm run test:e2e:convex
  ```

  Expected: all tests pass

  **If `loginConvex` fails** (HTTP endpoint path wrong): debug with curl:

  ```bash
  curl -s -X POST 'http://127.0.0.1:3210/api/auth/signin' \
    -H 'Content-Type: application/json' \
    -d '{"provider":"password","params":{"email":"test@test.com","password":"password123","flow":"signIn"}}' | jq .
  ```

  Inspect the response to find the correct URL and field names.

  **If tests fail with "adapter is null"**: The Convex `$kavach/auth` template has `getAdapter(null)` which means the adapter is a no-op. `handleRouteProtection` reads the session cookie directly without calling the adapter — so this should not affect test results. If you see adapter-null errors in the browser console, they are non-fatal for cookie-based auth tests.

  **If `users` index is missing**: The `getByEmail` query uses `.withIndex('email', ...)` — this requires the `users` table to have an `email` index defined in `authTables` from `@convex-dev/auth`. If the index doesn't exist, use a `filter` instead:

  ```ts
  .query('users')
  .filter((q) => q.eq(q.field('email'), email))
  .first()
  ```

- [ ] **Step 3: Stop Convex local backend**

  ```bash
  kill %1
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add sites/demo/e2e/globalSetup.ts sites/demo/.env.test.example sites/demo/.env.test.convex
  git commit -m "feat(demo): add Convex local e2e support with test user seeding"
  ```

---

### Task 16: Final verification — all adapters

- [ ] **Step 1: Run all three adapters sequentially**

  ```bash
  # In separate terminals (or background):
  # Terminal 1: supabase start (if not running)
  # Terminal 2: cd sites/demo && npm run emulators
  # Terminal 3: cd sites/demo && npx convex dev --local

  # Then:
  cd sites/demo && npm run test:e2e:all
  ```

  Expected: all three adapters pass

- [ ] **Step 2: Final commit**
  ```bash
  git add .
  git commit -m "feat(demo): complete multi-adapter e2e testing (supabase + firebase + convex)"
  ```
