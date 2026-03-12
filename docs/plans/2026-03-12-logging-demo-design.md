# Logging Writers + Sites/Demo — Design Spec

**Date:** 2026-03-12
**Status:** Approved

---

## Goal

1. Add `getLogWriter()` to Firebase and Convex adapters so they support structured logging via `@kavach/logger`, consistent with the Supabase pattern.
2. Extract the demo into a standalone `sites/demo` SvelteKit app, driven by `KAVACH_ADAPTER` env var, deployable as three separate Vercel projects (supabase, firebase, convex) each with their own subdomain.
3. Update the Vite plugin to support firebase and convex adapter templates.
4. Update `sites/learn` to link out to the live demo deployments and mark firebase/convex as live.

---

## Section 1: Logging Writers

### Firebase — `getLogWriter(db, options)`

- **File:** `adapters/firebase/src/writer.ts`
- **Signature:** `getLogWriter(db: Firestore, options?: { collection?: string }): { write(data: object): Promise<void> }`
- **Mechanism:** `addDoc(collection(db, collectionName), { ...data, timestamp: serverTimestamp() })`
- **Default collection:** `'logs'`
- **Error handling:** Errors are swallowed (log failures must never crash the app); optionally logged to `console.error` in dev.
- **Export:** Added to `adapters/firebase/src/index.ts`
- **Capabilities:** `capabilities.logging: true` (already updated in previous session)

### Convex — `getLogWriter(client, api, options)`

- **File:** `adapters/convex/src/writer.js`
- **Signature:** `getLogWriter(client: ConvexReactClient, api: any, options?: { entity?: string }): { write(data: object): Promise<void> }`
- **Mechanism:** `client.mutation(api[entity].create, data)` — requires user to define `api.logs.create` mutation in their Convex backend
- **Default entity:** `'logs'`
- **Error handling:** Same as Firebase — swallow, optionally `console.error`
- **Export:** Added to `adapters/convex/src/index.js`
- **Capabilities:** `capabilities.logging: true` (already updated in previous session)

---

## Section 2: Vite Plugin Updates

**File:** `packages/vite/src/config.js`

- Add `'firebase'` and `'convex'` to `KNOWN_ADAPTERS`

**New template files:**

- `packages/vite/src/templates/auth-firebase.js` — mirrors `auth-supabase.js` pattern:

  ```js
  // Populated by vite plugin; vars: apiKey, projectId, appId, logCollection, logLevel, rules
  import { initializeApp } from 'firebase/app'
  import { getFirestore } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { getAdapter, getLogWriter } from '@kavach/adapter-firebase'

  const app = initializeApp({ apiKey: '{{apiKey}}', projectId: '{{projectId}}', appId: '{{appId}}' })
  const db = getFirestore(app)
  const auth = getAuth(app)
  const adapter = getAdapter(auth)
  const writer = getLogWriter(db, { collection: '{{logCollection}}' })
  const logger = getLogger(writer, { level: '{{logLevel}}' })
  export const kavach = createKavach(adapter, { logger, rules: {{rules}} })
  ```

- `packages/vite/src/templates/auth-convex.js` — similar pattern using `ConvexReactClient` and `getLogWriter`

---

## Section 3: `sites/demo` Shared App

**New directory:** `sites/demo/`

**Architecture:** Single SvelteKit codebase. Adapter selected at runtime/deploy time via `KAVACH_ADAPTER` env var (defaults to `'supabase'`). All adapter-specific config lives in `ADAPTER_CONFIGS` object.

### `kavach.config.js` structure:

```js
const ADAPTER_CONFIGS = {
  supabase: {
    env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
    providers: [
      { name: 'google', label: 'Continue with Google' },
      { mode: 'otp', name: 'magic', label: 'Email Magic Link' }
    ],
    logging: { table: 'audit.logs' }
  },
  firebase: {
    env: {
      apiKey: 'PUBLIC_FIREBASE_API_KEY',
      projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
      appId: 'PUBLIC_FIREBASE_APP_ID'
    },
    providers: [
      { name: 'google', label: 'Continue with Google' },
      { mode: 'otp', name: 'magic', label: 'Email Magic Link' }
    ],
    logging: { collection: 'logs' }
  },
  convex: {
    env: { url: 'PUBLIC_CONVEX_URL' },
    providers: [{ name: 'google', label: 'Continue with Google' }],
    logging: { entity: 'logs' }
  }
}

const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'
export default {
  adapter,
  ...ADAPTER_CONFIGS[adapter],
  routes: { auth: '(public)/auth', logout: '/logout' },
  rules: [
    { path: '/dashboard', role: '*' },
    { path: '/admin', role: 'admin' }
  ]
}
```

### Pages (minimal, shared):

- `/` — landing/hero (adapter name in tagline)
- `/auth` — sign in page (providers driven by config)
- `/dashboard` — protected, shows user info + space facts
- `/admin` — admin-only, shows admin stats
- `/data` — shows fetched records from `/data/[entity]`
- `/logout` — signs out, redirects to `/auth`

### Data API:

- `src/routes/(server)/data/[...slug]/+server.ts` — same pattern as `sites/learn`, role-based filtering

---

## Section 4: Local Dev + E2E Testing

### Firebase Emulator Suite

- **File:** `sites/demo/firebase.json` — configures emulators (auth: 9099, firestore: 8080)
- **File:** `sites/demo/.firebaserc` — project alias
- **Script:** `"emulators": "firebase emulators:start"` in `sites/demo/package.json`
- **E2E env:** `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST` env vars — set in Playwright config when `KAVACH_ADAPTER=firebase`

### Convex Local Backend

- **Script:** `"convex:dev": "npx convex dev"` in `sites/demo/package.json`
- **E2E env:** `PUBLIC_CONVEX_URL=http://localhost:3210` when `KAVACH_ADAPTER=convex`

### E2E Tests

- **Directory:** `sites/demo/e2e/`
- **Parameterization:** Tests import a shared spec from `e2e/shared/auth.spec.ts`; adapter-specific config passed via env
- **Coverage per adapter:** sign-in → dashboard → verify user info → admin (role check) → data page → logout
- **CI:** Three separate test runs, one per `KAVACH_ADAPTER` value

---

## Section 5: Learn Site Updates

### `sites/learn/src/lib/demo/platforms.ts`

- `firebase` and `convex` entries: `live: true`, `url: 'https://firebase.demo.kavach.dev'` / `'https://convex.demo.kavach.dev'`

### Demo cards (`/demo/[platform]`)

- Cards for live platforms show "Launch demo →" button linking to the demo URL
- Cards for non-live platforms keep existing "Coming soon" state

### Vercel Deployment

Three separate Vercel projects from same repo:

- Root directory: `sites/demo`
- `KAVACH_ADAPTER=supabase` → `supabase.demo.kavach.dev`
- `KAVACH_ADAPTER=firebase` → `firebase.demo.kavach.dev`
- `KAVACH_ADAPTER=convex` → `convex.demo.kavach.dev`

Each project has adapter-specific env vars set in Vercel dashboard.

---

## Out of Scope

- Multi-tenancy or user-created accounts in demo
- Persistence between demo sessions
- Admin role assignment UI (seeded via backend directly)
- Actual Vercel project creation (manual step, documented in README)
