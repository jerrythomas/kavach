# Logging Writers + Sites/Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `getLogWriter()` to Firebase and Convex adapters, update the Vite plugin to support both, create `sites/demo` as a standalone multi-adapter SvelteKit app, and update `sites/learn` to link out to live demo deployments.

**Architecture:** Three independent deliverables built in sequence: (1) logging writers in adapter packages — tested in isolation, (2) Vite plugin templates for firebase/convex auth modules, (3) new `sites/demo` SvelteKit app whose adapter is selected at deploy time via `KAVACH_ADAPTER` env var. Learn site updates are final cosmetic touches. No shared state between tasks.

**Tech Stack:** TypeScript (Firebase writer), plain JS (Convex writer), Vite plugin (virtual module codegen), SvelteKit 5, Playwright (e2e), Firebase Emulator Suite, Convex local dev

---

## Chunk 1: Logging writers + Vite plugin

### Task 1: Firebase `getLogWriter()`

**Files:**

- Create: `adapters/firebase/spec/writer.spec.ts`
- Create: `adapters/firebase/src/writer.ts`
- Modify: `adapters/firebase/src/index.ts`

**Context:** Supabase reference: `adapters/supabase/src/writer.ts` (simple `insert`). Firebase Firestore: `addDoc(collection(db, name), data)` appends a doc. Errors must be swallowed — logging failures must never crash the app. `serverTimestamp()` from `firebase/firestore` adds a server-side timestamp.

- [ ] **Step 1: Write the failing test**

```typescript
// adapters/firebase/spec/writer.spec.ts
import { getLogWriter } from '../src/writer'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn().mockReturnValue('colRef'),
  addDoc: vi.fn().mockResolvedValue({ id: 'doc123' }),
  serverTimestamp: vi.fn().mockReturnValue('__timestamp__')
}))

describe('getLogWriter (firebase)', () => {
  const db = {} as any
  beforeEach(() => vi.clearAllMocks())

  it('returns a writer with a write function', () => {
    const writer = getLogWriter(db)
    expect(writer).toEqual({ write: expect.any(Function) })
  })

  it('writes to the default "logs" collection', async () => {
    const writer = getLogWriter(db)
    await writer.write({ level: 'info', message: 'hello' })
    expect(collection).toHaveBeenCalledWith(db, 'logs')
    expect(addDoc).toHaveBeenCalledWith('colRef', {
      level: 'info',
      message: 'hello',
      timestamp: '__timestamp__'
    })
  })

  it('uses a custom collection name when provided', async () => {
    const writer = getLogWriter(db, { collection: 'audit' })
    await writer.write({ level: 'error', message: 'oops' })
    expect(collection).toHaveBeenCalledWith(db, 'audit')
  })

  it('swallows errors silently — log failures must not crash the app', async () => {
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'))
    const writer = getLogWriter(db)
    await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/Jerry/Developer/kavach
NODE_NO_WARNINGS=1 bunx vitest run adapters/firebase/spec/writer.spec.ts --config config/vitest.config.js
```

Expected: FAIL — `Cannot find module '../src/writer'`

- [ ] **Step 3: Write the implementation**

```typescript
// adapters/firebase/src/writer.ts
import {
  collection as firestoreCollection,
  addDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore'

export function getLogWriter(db: Firestore, options: { collection?: string } = {}) {
  const collectionName = options.collection ?? 'logs'
  return {
    async write(data: Record<string, unknown>) {
      try {
        await addDoc(firestoreCollection(db, collectionName), {
          ...data,
          timestamp: serverTimestamp()
        })
      } catch {
        // swallow — log failures must not crash the app
      }
    }
  }
}
```

- [ ] **Step 4: Export from index**

Edit `adapters/firebase/src/index.ts` — add `getLogWriter`:

```typescript
export { getAdapter, transformResult } from './adapter'
export { getActions } from './actions'
export { getLogWriter } from './writer'
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
NODE_NO_WARNINGS=1 bunx vitest run adapters/firebase/spec/writer.spec.ts --config config/vitest.config.js
```

Expected: 4 tests PASS

- [ ] **Step 6: Run full test suite to confirm no regressions**

```bash
NODE_NO_WARNINGS=1 bunx vitest run --config config/vitest.config.js
```

Expected: all tests pass (608+)

- [ ] **Step 7: Commit**

```bash
git add adapters/firebase/spec/writer.spec.ts adapters/firebase/src/writer.ts adapters/firebase/src/index.ts
git commit -m "feat(firebase): add getLogWriter() — Firestore collection writer"
```

---

### Task 2: Convex `getLogWriter()`

**Files:**

- Create: `adapters/convex/spec/writer.spec.js`
- Create: `adapters/convex/src/writer.js`
- Modify: `adapters/convex/src/index.js`

**Context:** Convex writer calls `client.mutation(api[entity].create, data)`. The `api` object is the user's Convex API reference (e.g. `import { api } from '../convex/_generated/api'`). Missing the entity key in `api` is a runtime error — swallow it like all other write errors. No server timestamp needed — Convex mutations can add timestamps in backend code.

- [ ] **Step 1: Write the failing test**

```javascript
// adapters/convex/spec/writer.spec.js
import { getLogWriter } from '../src/writer'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getLogWriter (convex)', () => {
  const mockMutation = vi.fn().mockResolvedValue({})
  const client = { mutation: mockMutation }
  const api = { logs: { create: 'logs:create' } }

  beforeEach(() => vi.clearAllMocks())

  it('returns a writer with a write function', () => {
    const writer = getLogWriter(client, api)
    expect(writer).toEqual({ write: expect.any(Function) })
  })

  it('calls api.logs.create by default', async () => {
    const writer = getLogWriter(client, api)
    await writer.write({ level: 'info', message: 'hello' })
    expect(client.mutation).toHaveBeenCalledWith('logs:create', {
      level: 'info',
      message: 'hello'
    })
  })

  it('uses a custom entity name when provided', async () => {
    const customApi = { audit: { create: 'audit:create' } }
    const writer = getLogWriter(client, customApi, { entity: 'audit' })
    await writer.write({ message: 'test' })
    expect(client.mutation).toHaveBeenCalledWith('audit:create', { message: 'test' })
  })

  it('swallows errors silently — log failures must not crash the app', async () => {
    client.mutation.mockRejectedValueOnce(new Error('Convex error'))
    const writer = getLogWriter(client, api)
    await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
  })

  it('swallows missing entity errors silently', async () => {
    const writer = getLogWriter(client, {}, { entity: 'missing' })
    await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
NODE_NO_WARNINGS=1 bunx vitest run adapters/convex/spec/writer.spec.js --config config/vitest.config.js
```

Expected: FAIL — `Cannot find module '../src/writer'`

- [ ] **Step 3: Write the implementation**

```javascript
// adapters/convex/src/writer.js
export function getLogWriter(client, api, options = {}) {
  const entity = options.entity ?? 'logs'
  return {
    async write(data) {
      try {
        await client.mutation(api[entity].create, data)
      } catch {
        // swallow — log failures must not crash the app
      }
    }
  }
}
```

- [ ] **Step 4: Export from index**

Edit `adapters/convex/src/index.js`:

```javascript
// skipcq: JS-E1004 - Needed for exposing JS Doc types
export * from './types'
export { getAdapter } from './adapter'
export { getActions } from './actions'
export { getLogWriter } from './writer'
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
NODE_NO_WARNINGS=1 bunx vitest run adapters/convex/spec/writer.spec.js --config config/vitest.config.js
```

Expected: 5 tests PASS

- [ ] **Step 6: Run full test suite**

```bash
NODE_NO_WARNINGS=1 bunx vitest run --config config/vitest.config.js
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add adapters/convex/spec/writer.spec.js adapters/convex/src/writer.js adapters/convex/src/index.js
git commit -m "feat(convex): add getLogWriter() — mutation-based log writer"
```

---

### Task 3: Vite plugin — firebase + convex support

**Files:**

- Create: `packages/vite/src/templates/auth-firebase.js`
- Create: `packages/vite/src/templates/auth-convex.js`
- Modify: `packages/vite/src/templates.js`
- Modify: `packages/vite/src/config.js`
- Modify: `packages/vite/src/generate.js`
- Modify: `packages/vite/spec/config.spec.js`
- Modify: `packages/vite/spec/generate.spec.js`

**Context:** `packages/vite/src/templates/auth-supabase.js` is the canonical template — uses `{{var}}` placeholders. `generateAuth()` in `generate.js` reads the template and replaces placeholders. `validateConfig()` in `config.js` rejects unknown adapters. `packages/vite/src/templates.js` has **explicit** `readFileSync` entries (not auto-imported) — new templates must be added there manually.

- [ ] **Step 1: Create the Firebase auth template**

```javascript
// packages/vite/src/templates/auth-firebase.js
import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-firebase'
import { getLogger } from '@kavach/logger'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { env } from '$env/dynamic/public'

const app = initializeApp({
	apiKey: env.{{apiKey}},
	projectId: env.{{projectId}},
	appId: env.{{appId}}
})
const db = getFirestore(app)
const auth = getAuth(app)
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

- [ ] **Step 2: Create the Convex auth template**

```javascript
// packages/vite/src/templates/auth-convex.js
import { createKavach } from 'kavach'
import { getAdapter, getActions } from '@kavach/adapter-convex'
import { getLogger } from '@kavach/logger'
import { ConvexReactClient } from 'convex/react'
import { env } from '$env/dynamic/public'

// Logging: Convex getLogWriter() requires the user's api object (api.logs.create).
// Since the api import is project-specific, wire it up manually after scaffolding:
//   import { api } from '../convex/_generated/api'
//   import { getLogWriter } from '@kavach/adapter-convex'
//   const writer = getLogWriter(client, api, { entity: 'logs' })
//   const logger = getLogger(writer, { level: '{{logLevel}}' })
// Until then, getLogger(null) returns a no-op zero logger — no crash, no writes.
const client = new ConvexReactClient(env.{{url}})
// adapter: pass your useConvexAuth() result here once set up in the Svelte layout.
// The null placeholder means signIn/signOut are no-ops until replaced. See adapter docs.
const adapter = getAdapter(null)
const data = (api) => getActions(client, api)
const logger = getLogger(null, { level: '{{logLevel}}' })

export const kavach = createKavach(adapter, {
	data,
	logger,
	rules: {{rules}}
})
export { adapter, logger }
```

- [ ] **Step 3: Register templates in `packages/vite/src/templates.js`**

The `templates` object uses explicit `readFileSync` entries. Add two new lines (after the `authSupabase` line):

```javascript
// packages/vite/src/templates.js — add these two lines inside the templates object:
authFirebase: readFileSync(join(__dirname, 'templates/auth-firebase.js'), 'utf-8'),
authConvex: readFileSync(join(__dirname, 'templates/auth-convex.js'), 'utf-8')
```

The full file after edit:

```javascript
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const templates = {
  authPageCached: readFileSync(join(__dirname, 'templates/auth-page-cached.svelte'), 'utf-8'),
  authPage: readFileSync(join(__dirname, 'templates/auth-page.svelte'), 'utf-8'),
  dataRoute: readFileSync(join(__dirname, 'templates/data-route.js'), 'utf-8'),
  rpcRoute: readFileSync(join(__dirname, 'templates/rpc-route.js'), 'utf-8'),
  authSupabase: readFileSync(join(__dirname, 'templates/auth-supabase.js'), 'utf-8'),
  authFirebase: readFileSync(join(__dirname, 'templates/auth-firebase.js'), 'utf-8'),
  authConvex: readFileSync(join(__dirname, 'templates/auth-convex.js'), 'utf-8')
}
```

- [ ] **Step 4: Update `packages/vite/src/config.js`**

Replace these lines at the top:

```javascript
const KNOWN_ADAPTERS = ['supabase']

const ADAPTER_ENV_DEFAULTS = {
  supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}
```

With:

```javascript
const KNOWN_ADAPTERS = ['supabase', 'firebase', 'convex']

const ADAPTER_ENV_DEFAULTS = {
  supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
  firebase: {
    apiKey: 'PUBLIC_FIREBASE_API_KEY',
    projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
    appId: 'PUBLIC_FIREBASE_APP_ID'
  },
  convex: { url: 'PUBLIC_CONVEX_URL' }
}
```

Also update `parseConfig` — replace the entire `logging:` block (currently has only `level` + `table`) with this version that adds adapter-specific fields:

```javascript
// Replace the existing 4-line logging: block inside the parseConfig return:
logging: {
  level: raw.logging?.level ?? DEFAULTS.logging.level,
  table: raw.logging?.table ?? DEFAULTS.logging.table,
  collection: raw.logging?.collection,
  entity: raw.logging?.entity
},
```

The surrounding context in `parseConfig` looks like this for reference — replace only the `logging:` block:

```javascript
return {
  adapter: raw.adapter,
  providers: raw.providers ?? DEFAULTS.providers,
  cachedLogins: raw.cachedLogins ?? DEFAULTS.cachedLogins,
  logging: {                                          // ← replace this block
    level: raw.logging?.level ?? DEFAULTS.logging.level,
    table: raw.logging?.table ?? DEFAULTS.logging.table,
    collection: raw.logging?.collection,
    entity: raw.logging?.entity
  },
  env: { ...envDefaults, ...raw.env },
  ...
```

- [ ] **Step 5: Update `packages/vite/src/generate.js` — add firebase + convex cases**

In `generateAuth`, after the supabase branch and before `throw new Error`:

```javascript
if (config.adapter === 'firebase') {
  return templates.authFirebase
    .replaceAll('{{apiKey}}', env.apiKey)
    .replaceAll('{{projectId}}', env.projectId)
    .replaceAll('{{appId}}', env.appId)
    .replaceAll('{{logCollection}}', logging.collection ?? 'logs')
    .replaceAll('{{logLevel}}', logging.level)
    .replaceAll('{{rules}}', serialize(rules))
}

if (config.adapter === 'convex') {
  return templates.authConvex
    .replaceAll('{{url}}', env.url)
    .replaceAll('{{logLevel}}', logging.level)
    .replaceAll('{{rules}}', serialize(rules))
}
```

- [ ] **Step 6: Add tests for firebase + convex in `packages/vite/spec/config.spec.js`**

Add to the `validateConfig` describe block:

```javascript
it('should accept firebase adapter', () => {
  expect(() => validateConfig({ adapter: 'firebase' })).not.toThrow()
})

it('should accept convex adapter', () => {
  expect(() => validateConfig({ adapter: 'convex' })).not.toThrow()
})
```

Add to the `parseConfig` describe block:

```javascript
it('should apply firebase env defaults', () => {
  const result = parseConfig({ adapter: 'firebase' })
  expect(result.env.apiKey).toBe('PUBLIC_FIREBASE_API_KEY')
  expect(result.env.projectId).toBe('PUBLIC_FIREBASE_PROJECT_ID')
  expect(result.env.appId).toBe('PUBLIC_FIREBASE_APP_ID')
})

it('should apply convex env defaults', () => {
  const result = parseConfig({ adapter: 'convex' })
  expect(result.env.url).toBe('PUBLIC_CONVEX_URL')
})

it('should pass through firebase logging.collection', () => {
  const result = parseConfig({ adapter: 'firebase', logging: { collection: 'audit' } })
  expect(result.logging.collection).toBe('audit')
})
```

- [ ] **Step 7: Add firebase + convex tests in `packages/vite/spec/generate.spec.js`**

Add two new config constants and tests alongside the existing supabase test:

```javascript
const firebaseConfig = {
  adapter: 'firebase',
  providers: [],
  cachedLogins: false,
  logging: { level: 'info', collection: 'audit', table: 'logs', entity: undefined },
  env: {
    apiKey: 'PUBLIC_FIREBASE_API_KEY',
    projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
    appId: 'PUBLIC_FIREBASE_APP_ID'
  },
  routes: { auth: '/auth', data: '/data', rpc: '/rpc', logout: '/logout' },
  rules: []
}

const convexConfig = {
  adapter: 'convex',
  providers: [],
  cachedLogins: false,
  logging: { level: 'warn', table: 'logs', collection: undefined, entity: 'events' },
  env: { url: 'PUBLIC_CONVEX_URL' },
  routes: { auth: '/auth', data: '/data', rpc: '/rpc', logout: '/logout' },
  rules: []
}

it('should generate $kavach/auth module for firebase', () => {
  const code = generateModule('auth', firebaseConfig)
  expect(code).toContain("from '@kavach/adapter-firebase'")
  expect(code).toContain('initializeApp')
  expect(code).toContain('env.PUBLIC_FIREBASE_API_KEY')
  expect(code).toContain("collection: 'audit'")
  expect(code).toContain("level: 'info'")
})

it('should generate $kavach/auth module for convex', () => {
  const code = generateModule('auth', convexConfig)
  expect(code).toContain("from '@kavach/adapter-convex'")
  expect(code).toContain('ConvexReactClient')
  expect(code).toContain('env.PUBLIC_CONVEX_URL')
  expect(code).toContain("level: 'warn'")
  // Convex template intentionally omits getLogWriter (requires user's api import)
  // and uses null writer — getLogger(null) returns a safe no-op zero logger
  expect(code).not.toContain('getLogWriter')
  expect(code).toContain('getLogger(null')
})
```

- [ ] **Step 8: Run tests**

```bash
NODE_NO_WARNINGS=1 bunx vitest run packages/vite/spec/ --config config/vitest.config.js
```

Expected: all vite tests PASS

- [ ] **Step 9: Run full test suite**

```bash
NODE_NO_WARNINGS=1 bunx vitest run --config config/vitest.config.js
```

Expected: all tests pass

- [ ] **Step 10: Commit**

```bash
git add packages/vite/src/templates/auth-firebase.js \
        packages/vite/src/templates/auth-convex.js \
        packages/vite/src/templates.js \
        packages/vite/src/config.js \
        packages/vite/src/generate.js \
        packages/vite/spec/config.spec.js \
        packages/vite/spec/generate.spec.js
git commit -m "feat(vite): add firebase and convex adapter support + auth templates"
```

---

## Chunk 2: sites/demo core app

### Task 4: Scaffold sites/demo

**Files:**

- Create: `sites/demo/package.json`
- Create: `sites/demo/svelte.config.js`
- Create: `sites/demo/vite.config.js`
- Create: `sites/demo/kavach.config.js`
- Create: `sites/demo/src/app.html`
- Create: `sites/demo/src/hooks.server.js`
- Create: `sites/demo/src/routes/+layout.svelte`
- Create: `sites/demo/.env.example`

**Context:** `sites/learn` is the canonical reference. The demo is a stripped-down SvelteKit app. Key difference: no `[platform]` route param — the adapter is fixed by `KAVACH_ADAPTER` env var. Install all three adapters as deps so the dev can switch locally. The `kavach.config.js` reads `process.env.KAVACH_ADAPTER` (Node.js env, not SvelteKit's public env) at startup.

- [ ] **Step 1: Create `sites/demo/package.json`**

```json
{
  "name": "demo-kavach",
  "version": "1.0.0-next.1",
  "private": true,
  "packageManager": "bun@1.3.10",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write .",
    "test:e2e": "playwright test",
    "emulators": "firebase emulators:start",
    "convex:dev": "bunx convex dev"
  },
  "devDependencies": {
    "@kavach/vite": "workspace:*",
    "@playwright/test": "^1.58.2",
    "@sveltejs/adapter-auto": "^7.0.1",
    "@sveltejs/kit": "^2.54.0",
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "@unocss/extractor-svelte": "66.6.6",
    "@unocss/reset": "66.6.6",
    "@unocss/vite": "66.6.6",
    "eslint": "^10.0.3",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-svelte": "^3.15.2",
    "prettier": "^3.8.1",
    "prettier-plugin-svelte": "^3.5.1",
    "svelte": "^5.53.10",
    "svelte-check": "^4.4.5",
    "typescript": "^5.9.3",
    "unocss": "66.6.6",
    "vite": "^7.3.1"
  },
  "type": "module",
  "dependencies": {
    "@kavach/adapter-convex": "workspace:*",
    "@kavach/adapter-firebase": "workspace:*",
    "@kavach/adapter-supabase": "workspace:*",
    "@kavach/logger": "workspace:*",
    "@kavach/ui": "workspace:*",
    "@rokkit/actions": "latest",
    "@rokkit/app": "latest",
    "@rokkit/core": "latest",
    "@rokkit/icons": "latest",
    "@rokkit/states": "latest",
    "@rokkit/themes": "latest",
    "@rokkit/ui": "latest",
    "@rokkit/unocss": "latest",
    "convex": "^1.24.0",
    "firebase": "^10.14.1",
    "@supabase/supabase-js": "^2.99.1",
    "kavach": "workspace:*"
  }
}
```

- [ ] **Step 2: Create `sites/demo/svelte.config.js`** (identical to learn)

```javascript
import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  }
}

export default config
```

- [ ] **Step 3: Create `sites/demo/vite.config.js`** (identical to learn, simpler)

```javascript
import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import unocss from '@unocss/vite'

export default defineConfig({
  plugins: [kavach(), unocss(), sveltekit()]
})
```

- [ ] **Step 4: Create `sites/demo/kavach.config.js`**

```javascript
const ADAPTER_CONFIGS = {
  supabase: {
    env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
    providers: [
      { name: 'google', label: 'Continue with Google' },
      { mode: 'otp', name: 'magic', label: 'Email Magic Link' }
    ],
    logging: { level: 'error', table: 'audit.logs' }
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
    logging: { level: 'error', collection: 'logs' }
  },
  convex: {
    env: { url: 'PUBLIC_CONVEX_URL' },
    providers: [{ name: 'google', label: 'Continue with Google' }],
    logging: { level: 'error', entity: 'logs' }
  }
}

const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'

export default {
  adapter,
  ...ADAPTER_CONFIGS[adapter],
  routes: {
    auth: '/auth',
    data: '/data',
    logout: '/logout'
  },
  rules: [
    { path: '/', public: true },
    { path: '/auth', public: true },
    { path: '/dashboard', roles: '*' },
    { path: '/admin', roles: ['admin'] },
    { path: '/data', roles: '*' },
    { path: '/data/facts', roles: '*' },
    { path: '/data/admin-stats', roles: ['admin'] }
  ]
}
```

- [ ] **Step 5: Create `sites/demo/src/app.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" data-style="rokkit">
    <div style="display: contents" class="bg-surface-z1 text-surface-z8">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 6: Create `sites/demo/src/hooks.server.js`**

```javascript
import { kavach } from '$kavach/auth'

export const handle = ({ event, resolve }) => kavach.handle({ event, resolve })
```

- [ ] **Step 7: Create root layout `sites/demo/src/routes/+layout.svelte`**

```svelte
<script>
  import 'uno.css'
  import { vibe } from '@rokkit/states'
  import { themable } from '@rokkit/actions'

  let { children } = $props()
</script>

<svelte:head>
  <title>Kavach Demo</title>
  <meta name="description" content="Kavach authentication demo" />
</svelte:head>
<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-demo-theme' }} />

{@render children()}
```

- [ ] **Step 8: Create `sites/demo/.env.example`**

```bash
# Select adapter: supabase | firebase | convex
KAVACH_ADAPTER=supabase
PUBLIC_KAVACH_ADAPTER=supabase

# Supabase
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=

# Firebase (use emulator values for local dev)
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_PROJECT_ID=demo-kavach
PUBLIC_FIREBASE_APP_ID=

# Firebase emulator (set these when KAVACH_ADAPTER=firebase)
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
# FIRESTORE_EMULATOR_HOST=localhost:8080

# Convex
# PUBLIC_CONVEX_URL=http://localhost:3210
```

- [ ] **Step 9: Create `sites/demo/tsconfig.json`**

Required by `svelte-check`. Identical to `sites/learn/tsconfig.json`:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 10: Install dependencies**

```bash
cd sites/demo && bun install
```

Expected: `node_modules` created, no errors

- [ ] **Step 11: Verify site builds with supabase adapter**

Note: `KAVACH_ADAPTER` (Node env) drives `kavach.config.js` at build time. `PUBLIC_KAVACH_ADAPTER` (SvelteKit public env) is needed at runtime to show the adapter name in the UI. Both must be set together in `.env.local` and in Vercel — one is not sufficient. The build test below uses env vars inline:

```bash
cd sites/demo && KAVACH_ADAPTER=supabase PUBLIC_KAVACH_ADAPTER=supabase bun run build
```

Expected: build succeeds (requires `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to be set, or set them to placeholder strings for the build test: `PUBLIC_SUPABASE_URL=http://localhost PUBLIC_SUPABASE_ANON_KEY=test`)

- [ ] **Step 12: Commit**

```bash
git add sites/demo/
git commit -m "feat(demo): scaffold sites/demo — multi-adapter SvelteKit app"
```

---

### Task 5: sites/demo — public routes (landing + auth)

**Files:**

- Create: `sites/demo/src/routes/+page.svelte`
- Create: `sites/demo/src/routes/+layout.server.ts`
- Create: `sites/demo/src/routes/auth/+page.svelte`

**Context:** Landing page shows adapter name from `PUBLIC_KAVACH_ADAPTER` (SvelteKit public env). Auth page uses `@kavach/ui`'s `AuthProvider` component — same as the learn site. After successful auth, redirect to `/dashboard`.

- [ ] **Step 1: Create root `+layout.server.ts` to expose session everywhere**

```typescript
// sites/demo/src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    session: locals.session,
    user: locals.session?.user ?? null
  }
}
```

- [ ] **Step 2: Create landing page `sites/demo/src/routes/+page.svelte`**

```svelte
<script>
  import { env } from '$env/dynamic/public'

  const adapter = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
  const adapterLabel =
    { supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapter] ?? adapter
</script>

<div
  class="bg-surface-z0 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
>
  <div class="max-w-lg">
    <p class="text-primary mb-3 text-sm font-semibold tracking-wider uppercase">Kavach Demo</p>
    <h1 class="text-surface-z9 mb-4 text-4xl font-black">
      {adapterLabel} Authentication
    </h1>
    <p class="text-surface-z6 mb-8 text-lg">
      Role-based route protection, session management, and auth flows — powered by Kavach.
    </p>
    <a
      href="/auth"
      class="bg-primary inline-block rounded-xl px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
    >
      Sign in to try it →
    </a>
  </div>
</div>
```

- [ ] **Step 3: Create auth page `sites/demo/src/routes/auth/+page.svelte`**

Uses `$kavach/providers` (virtual module from Vite plugin) to render the configured providers, so all three adapters work without hardcoding.

```svelte
<script>
  import { goto } from '$app/navigation'
  import { AuthProvider } from '@kavach/ui'
  import { ThemeSwitcherToggle } from '@rokkit/app'
  import { providers } from '$kavach/providers'
  import { env } from '$env/dynamic/public'

  const adapter = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
  const adapterLabel =
    { supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapter] ?? adapter

  function onSuccess() {
    goto('/dashboard')
  }
</script>

<div class="bg-surface-z0 flex min-h-screen flex-col">
  <div class="fixed top-4 right-4 z-10">
    <ThemeSwitcherToggle />
  </div>

  <div class="flex flex-1 flex-col items-center justify-center px-6 py-16">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <a
          href="/"
          class="text-surface-z5 hover:text-primary mb-6 inline-block text-sm transition-colors"
        >
          ← Back
        </a>
        <h1 class="text-surface-z9 text-2xl font-black">Sign in</h1>
        <p class="text-surface-z6 mt-1 text-sm">{adapterLabel} · Kavach Demo</p>
      </div>

      <div class="bg-surface-z1 border-surface-z3 flex flex-col gap-4 rounded-2xl border p-6">
        {#each providers as p (p.name)}
          <AuthProvider
            name={p.name}
            mode={p.mode ?? 'oauth'}
            onsuccess={onSuccess}
            label={p.label}
          />
        {/each}
      </div>

      <p class="text-surface-z5 mt-4 text-center text-xs">
        Test credentials: <span class="font-mono">test@test.com / password123</span>
      </p>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Start dev server and verify routes load**

```bash
cd sites/demo && cp .env.example .env.local
# Edit .env.local with a real SUPABASE anon key, then:
bun run dev
```

Visit `http://localhost:5173` — should see landing page. Visit `/auth` — should see sign-in form.

- [ ] **Step 5: Commit**

```bash
git add sites/demo/src/routes/
git commit -m "feat(demo): add landing and auth pages"
```

---

### Task 6: sites/demo — app shell + protected pages

**Files:**

- Create: `sites/demo/src/routes/(app)/+layout@.svelte`
- Create: `sites/demo/src/routes/(app)/dashboard/+page.svelte`
- Create: `sites/demo/src/routes/(app)/admin/+page.svelte`
- Create: `sites/demo/src/routes/(app)/admin/+page.server.ts`
- Create: `sites/demo/src/routes/(app)/data/+page.svelte`
- Create: `sites/demo/src/routes/(app)/logout/+page.svelte`

**Context:** The `@` in `+layout@.svelte` resets the layout chain (breaks out of root layout). The app shell is similar to `sites/learn/src/routes/(app)/demo/+layout@.svelte` but without the `[platform]` param — adapter is shown from env. Auth context must be set up in this layout via `onMount` + `setContext('kavach', ...)` exactly as in the learn site.

- [ ] **Step 1: Create `sites/demo/src/routes/(app)/+layout@.svelte`** — app shell with header + sidebar

```svelte
<script>
  import { ThemeSwitcherToggle } from '@rokkit/app'
  import { setContext, onMount } from 'svelte'
  import { page } from '$app/stores'
  import { env } from '$env/dynamic/public'

  let { children, data } = $props()

  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { createKavach } = await import('kavach')
    const { adapter: authAdapter, logger } = await import('$kavach/auth')
    const { invalidateAll } = await import('$app/navigation')
    const instance = createKavach(authAdapter, { logger, invalidateAll })
    Object.assign(kavach, instance)
    instance.onAuthChange($page.url)
  })

  const user = $derived(data?.user ?? null)
  const role = $derived(user?.role ?? null)
  const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
  const adapterLabel =
    { supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapterId] ?? adapterId

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: 'i-app-list' },
    { href: '/data', label: 'Space Facts', icon: 'i-app-list' },
    { href: '/admin', label: 'Admin Panel', icon: 'i-app-shield' },
    { href: '/logout', label: 'Sign Out', icon: 'i-app-logout' }
  ]
</script>

<div class="bg-surface-z0 text-surface-z9 flex h-screen flex-col overflow-hidden">
  <!-- Top bar -->
  <header class="border-surface-z2 bg-surface-z1 flex h-14 shrink-0 items-center border-b px-4">
    <div class="flex items-center gap-2">
      <span class="text-surface-z9 font-bold">DemoApp</span>
      <span class="text-surface-z3">·</span>
      <span class="text-surface-z6 text-sm">{adapterLabel}</span>
    </div>
    <div class="flex-1"></div>
    <div class="flex items-center gap-3">
      <ThemeSwitcherToggle />
      {#if user}
        <div class="flex items-center gap-2">
          <div
            class="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          >
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div class="hidden flex-col text-right sm:flex">
            <span class="text-surface-z8 text-xs font-medium">{user.email}</span>
            <span
              class="font-mono text-xs {role === 'admin' ? 'text-warning-600' : 'text-primary'}"
            >
              {role ?? 'authenticated'}
            </span>
          </div>
        </div>
      {/if}
    </div>
  </header>

  <!-- Body -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <aside class="border-surface-z2 bg-surface-z1 w-52 shrink-0 overflow-y-auto border-r">
      <nav class="flex flex-col gap-1 p-3">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-surface-z6 hover:bg-surface-z2 hover:text-surface-z9 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <span class="{link.icon} h-4 w-4" aria-hidden="true"></span>
            {link.label}
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-y-auto p-6 lg:p-8">
      {@render children()}
    </main>
  </div>
</div>
```

- [ ] **Step 2: Create `sites/demo/src/routes/(app)/dashboard/+page.svelte`**

```svelte
<script>
  let { data } = $props()
  const user = $derived(data?.user ?? null)
  const role = $derived(user?.role ?? null)
</script>

<div class="flex flex-col gap-6">
  <div class="border-surface-z3 bg-surface-z1 rounded-2xl border p-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-surface-z9 text-2xl font-black">Welcome back</h1>
        <p class="text-surface-z6 mt-1 text-sm">{user?.email ?? 'Unknown user'}</p>
      </div>
      <span
        class="rounded-full px-3 py-1 font-mono text-sm font-bold {role === 'admin'
          ? 'bg-warning-100 text-warning-700'
          : 'bg-primary/10 text-primary'}"
      >
        {role ?? 'authenticated'}
      </span>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <a
      href="/data"
      class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
    >
      <span class="i-app-list text-primary h-6 w-6" aria-hidden="true"></span>
      <span class="text-surface-z8 font-semibold">Space Facts</span>
      <span class="text-surface-z6 text-xs">Role-gated data</span>
      <span class="text-success-600 text-xs">✓ Open to all users</span>
    </a>

    <a
      href="/admin"
      class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow {role !==
      'admin'
        ? 'opacity-60'
        : ''}"
    >
      <span class="i-app-shield text-primary h-6 w-6" aria-hidden="true"></span>
      <span class="text-surface-z8 font-semibold">Admin Panel</span>
      <span class="text-surface-z6 text-xs">Admin-only section</span>
      {#if role === 'admin'}
        <span class="text-success-600 text-xs">✓ Admin access granted</span>
      {:else}
        <span class="text-error-500 text-xs">✗ Requires admin role</span>
      {/if}
    </a>

    <a
      href="/logout"
      class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
    >
      <span class="i-app-logout text-primary h-6 w-6" aria-hidden="true"></span>
      <span class="text-surface-z8 font-semibold">Sign Out</span>
      <span class="text-surface-z6 text-xs">End the session</span>
    </a>
  </div>

  <div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
    <p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
    <code class="text-primary font-mono">{`{ path: '/dashboard', roles: '*' }`}</code>
    <p class="text-surface-z6 mt-1 text-xs">
      Any authenticated user can access this page. Unauthenticated visitors are redirected to <code
        >/auth</code
      >.
    </p>
  </div>
</div>
```

- [ ] **Step 3: Create `sites/demo/src/routes/(app)/admin/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  const role = locals.session?.user?.role
  if (!role || role !== 'admin') {
    redirect(303, '/dashboard')
  }
  return { session: locals.session }
}
```

- [ ] **Step 4: Create `sites/demo/src/routes/(app)/admin/+page.svelte`**

```svelte
<script>
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
</script>

<div class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold">Admin Panel</h1>

  <div class="bg-warning-100 border-warning-300 rounded-lg border p-4">
    <p class="text-warning-900">
      This page is only accessible to users with the
      <code class="bg-warning-200 rounded px-1">admin</code> role. Non-admin users are redirected to dashboard
      automatically.
    </p>
  </div>

  <div class="border-surface-z3 rounded-lg border p-4">
    <h2 class="text-surface-z5 mb-3 text-sm font-semibold uppercase">Session Info</h2>
    <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt class="text-surface-z6">Email</dt>
      <dd class="font-medium">{data.session?.user?.email ?? '—'}</dd>
      <dt class="text-surface-z6">Role</dt>
      <dd>
        <span
          class="bg-success-100 text-success-800 rounded px-2 py-0.5 text-xs font-semibold uppercase"
        >
          {data.session?.user?.role ?? 'none'}
        </span>
      </dd>
      <dt class="text-surface-z6">User ID</dt>
      <dd class="text-surface-z7 font-mono text-xs">{data.session?.user?.id ?? '—'}</dd>
    </dl>
  </div>

  <div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
    <p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
    <code class="text-primary font-mono">{`{ path: '/admin', roles: ['admin'] }`}</code>
    <p class="text-surface-z6 mt-1 text-xs">
      Enforced server-side via sentry. Non-admin users get a 303 redirect.
    </p>
  </div>
</div>
```

- [ ] **Step 5: Create `sites/demo/src/routes/(app)/data/+page.svelte`**

```svelte
<script>
  let { data } = $props()
  const isAdmin = $derived(data?.user?.role === 'admin')

  let facts = $state([])
  let error = $state(null)
  let loading = $state(false)

  async function fetchFacts() {
    loading = true
    error = null
    try {
      const res = await fetch('/data/facts')
      if (!res.ok) {
        const body = await res.json()
        error = body.error ?? `HTTP ${res.status}`
      } else {
        facts = await res.json()
      }
    } catch (e) {
      error = e.message
    }
    loading = false
  }
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-2xl font-bold">Space Facts</h1>
    <p class="text-surface-z7 mt-1 text-sm">
      Role-gated data — general facts for all users, classified for admins.
    </p>
  </div>

  <div class="flex items-center gap-3">
    <button
      onclick={fetchFacts}
      disabled={loading}
      class="bg-primary rounded px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading ? 'Loading…' : 'Load Facts'}
    </button>
    {#if isAdmin}
      <span class="bg-warning-100 text-warning-800 rounded px-2 py-1 text-xs font-semibold">
        👑 Admin — you can see classified facts
      </span>
    {:else}
      <span class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
        🔑 Authenticated — general facts only
      </span>
    {/if}
  </div>

  {#if error}
    <p class="text-error-600 text-sm">{error}</p>
  {/if}

  {#if facts.length > 0}
    <div class="flex flex-col gap-3">
      {#each facts as item (item.id)}
        <div
          class="border-surface-z3 rounded-lg border p-4"
          class:bg-warning-50={item.tier === 'classified'}
          class:border-warning-300={item.tier === 'classified'}
        >
          <div class="mb-1 flex items-center gap-2">
            <span class="text-surface-z6 text-xs font-semibold uppercase">{item.category}</span>
            {#if item.tier === 'classified'}
              <span class="bg-warning-200 text-warning-800 rounded px-1.5 text-xs font-bold"
                >CLASSIFIED</span
              >
            {/if}
          </div>
          <p class="text-sm leading-relaxed">{item.fact}</p>
        </div>
      {/each}
    </div>
  {/if}

  <div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
    <p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
    <code class="text-primary font-mono">{`{ path: '/data/facts', roles: '*' }`}</code>
    <p class="text-surface-z6 mt-1 text-xs">
      The API filters classified facts server-side based on role — no client-side filtering.
    </p>
  </div>
</div>
```

- [ ] **Step 6: Create `sites/demo/src/routes/(app)/logout/+page.svelte`**

```svelte
<script>
  import { onMount, getContext } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(async () => {
    const kavach = getContext('kavach')
    if (kavach?.signOut) await kavach.signOut()
    goto('/')
  })
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-8">
  <div class="text-center">
    <h1 class="mb-4 text-2xl font-bold">Signing out...</h1>
    <p class="text-surface-z7">You will be redirected shortly.</p>
  </div>
</div>
```

- [ ] **Step 7: Verify app routes load with supabase adapter**

With dev server running and a valid session cookie set:

- `/dashboard` — page title `h1` reads "Welcome back", header shows the user's email
- `/admin` — redirects to `/dashboard` for non-admin users; for admin, `h1` reads "Admin Panel"
- `/data` — "Load Facts" button is visible; clicking it shows at least 1 fact card
- `/logout` — redirects to `/` within 3 seconds

- [ ] **Step 8: Commit**

```bash
git add sites/demo/src/routes/
git commit -m "feat(demo): add app shell + protected pages (dashboard, admin, data, logout)"
```

---

### Task 7: sites/demo — data API route

**Files:**

- Create: `sites/demo/src/routes/(server)/data/[...slug]/+server.ts`

**Context:** Copied from `sites/learn/src/routes/(server)/data/[...slug]/+server.ts` — same logic. In-memory seed facts (resets on server restart). GET `/data/facts` — role-filtered. GET `/data/admin-stats` — admin-only. No POST/DELETE in demo (read-only for simplicity).

- [ ] **Step 1: Create the data API route**

```typescript
// sites/demo/src/routes/(server)/data/[...slug]/+server.ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

interface Fact {
  id: number
  tier: 'general' | 'classified'
  category: string
  fact: string
}

const SEED_FACTS: Fact[] = [
  {
    id: 1,
    tier: 'general',
    category: 'Solar System',
    fact: 'A day on Venus is longer than a year on Venus — it rotates so slowly that the Sun rises only twice per orbit.'
  },
  {
    id: 2,
    tier: 'general',
    category: 'Stars',
    fact: 'Neutron stars can spin 600 times per second and are only ~20 km in diameter — yet outweigh the Sun.'
  },
  {
    id: 3,
    tier: 'general',
    category: 'Scale',
    fact: 'Light takes 8 minutes to travel from the Sun to Earth, and over 4 years to reach the next star system.'
  },
  {
    id: 4,
    tier: 'general',
    category: 'Black Holes',
    fact: 'The supermassive black hole at the centre of M87 has a mass of 6.5 billion Suns. Its shadow was imaged in 2019.'
  },
  {
    id: 5,
    tier: 'general',
    category: 'Galaxies',
    fact: 'The Milky Way is estimated to contain 100–400 billion stars, yet it is just one of at least two trillion galaxies.'
  },
  {
    id: 6,
    tier: 'classified',
    category: 'MISSION ALPHA',
    fact: '🔴 CLASSIFIED: A sequence of prime numbers carved in ascending order was detected on asteroid 2029-XK7. Origin: unknown.'
  },
  {
    id: 7,
    tier: 'classified',
    category: 'MISSION SIGMA',
    fact: '🔴 CLASSIFIED: Voyager 1 began transmitting an unrecognised binary pattern in 2031. Engineers are calling it "the reply".'
  },
  {
    id: 8,
    tier: 'classified',
    category: 'MISSION OMEGA',
    fact: '🔴 CLASSIFIED: An anomalous radio silence spanning sector 7G has persisted for 18 months.'
  }
]

export const GET: RequestHandler = ({ params, locals }) => {
  if (!locals.session) return json({ error: 'Not authenticated' }, { status: 401 })

  const entity = params.slug
  const role = locals.session?.user?.role ?? null

  if (entity === 'facts') {
    const visible = role === 'admin' ? SEED_FACTS : SEED_FACTS.filter((f) => f.tier === 'general')
    return json(visible)
  }

  if (entity === 'admin-stats') {
    return json({
      totalFacts: SEED_FACTS.length,
      generalFacts: SEED_FACTS.filter((f) => f.tier === 'general').length,
      classifiedFacts: SEED_FACTS.filter((f) => f.tier === 'classified').length,
      role
    })
  }

  return json({ error: 'Not found' }, { status: 404 })
}
```

- [ ] **Step 2: Verify data API works**

With dev server running and authenticated session:

```bash
curl http://localhost:5173/data/facts
```

Expected: JSON array of general facts (5 items for non-admin)

- [ ] **Step 3: Commit**

```bash
git add sites/demo/src/routes/\(server\)/
git commit -m "feat(demo): add data API — role-filtered space facts + admin-stats"
```

---

## Chunk 3: E2E tests + Learn site updates

### Task 8: sites/demo — Playwright e2e tests

**Files:**

- Create: `sites/demo/playwright.config.js`
- Create: `sites/demo/e2e/demo.e2e.ts`

**Context:** Tests run against the supabase adapter by default (using the local Supabase stack). The pattern mirrors `sites/learn/e2e/demo.e2e.ts`. For firebase/convex adapters, tests would need `KAVACH_ADAPTER` set and the appropriate local backend running — document this but implement supabase tests for now (the ones that can run in CI).

`loginAsUser` helper from the learn site's e2e tests sets a session cookie directly (bypasses UI) — copy this exact pattern.

- [ ] **Step 1: Create `sites/demo/playwright.config.js`**

```javascript
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: true,
    env: {
      KAVACH_ADAPTER: process.env.KAVACH_ADAPTER ?? 'supabase',
      PUBLIC_KAVACH_ADAPTER: process.env.KAVACH_ADAPTER ?? 'supabase'
    }
  },
  testDir: 'e2e',
  testMatch: /.*\.e2e\.[jt]s/
}

export default config
```

- [ ] **Step 2: Create `sites/demo/e2e/demo.e2e.ts`**

```typescript
import { expect, test } from '@playwright/test'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

async function loginAsUser(page, email = 'test@test.com', password = 'password123') {
  const response = await page
    .context()
    .request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY }
    })
  const token = await response.json()

  await page.route('**/auth/session', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )

  const session = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    user: { id: token.user.id, role: token.user.role, email: token.user.email }
  }
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

  await page.goto('/dashboard')
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await page.waitForLoadState('domcontentloaded')
}

test.describe('Landing page', () => {
  test('shows adapter name and sign in link', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Authentication')
    await expect(page.locator('a[href="/auth"]')).toBeVisible()
  })
})

test.describe('Auth page', () => {
  test('auth page loads and shows sign in form', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('unauthenticated user redirected from dashboard to auth', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth/)
  })
})

test.describe('Authenticated user', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('dashboard shows welcome and user email', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.locator('header')).toContainText('test@test.com')
  })

  test('data page loads facts after clicking Load Facts', async ({ page }) => {
    await page.goto('/data')
    await page.click('button:has-text("Load Facts")')
    await page.waitForSelector('.rounded-lg.border.p-4', { state: 'visible', timeout: 5000 })
    const facts = page.locator('.rounded-lg.border.p-4')
    await expect(facts).toHaveCount(5) // general facts only for non-admin
  })

  test('admin page redirects non-admin to dashboard', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logout signs out and redirects to landing', async ({ page }) => {
    await page.goto('/logout')
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 })
  })
})

test.describe('Admin user', () => {
  test.beforeEach(async ({ page }) => {
    // admin user must exist in local Supabase with role='admin'
    await loginAsUser(page, 'admin@test.com', 'password123')
  })

  test('admin page shows session info', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText('Admin Panel')
    await expect(page.locator('dd:has-text("admin")')).toBeVisible()
  })

  test('data page shows classified facts for admin', async ({ page }) => {
    await page.goto('/data')
    await page.click('button:has-text("Load Facts")')
    await page.waitForSelector('.rounded-lg.border.p-4', { state: 'visible', timeout: 5000 })
    const facts = page.locator('.rounded-lg.border.p-4')
    await expect(facts).toHaveCount(8) // all 8 facts for admin
  })
})
```

- [ ] **Step 3: Run e2e tests**

```bash
cd sites/demo && npm run test:e2e
```

Note: Requires Supabase local stack running (`supabase start`) and `test@test.com` + `admin@test.com` users seeded. Expected: tests pass for authenticated + landing + auth flows.

- [ ] **Step 4: Commit**

```bash
git add sites/demo/playwright.config.js sites/demo/e2e/
git commit -m "test(demo): add Playwright e2e tests — landing, auth, dashboard, admin, data"
```

---

### Task 9: Learn site updates — mark firebase + convex live

**Files:**

- Modify: `sites/learn/src/lib/demo/platforms.ts`
- Modify: `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`

**Context:** `platforms.ts` defines the `Platform` interface and `PLATFORMS` array. Firebase and convex are currently `live: false`. Update to `live: true` and add `url` field pointing to demo deployments. The `+page.svelte` already checks `platform?.live` to show LIVE/MOCK badge — need to add a "Launch demo →" button for live platforms.

- [ ] **Step 1: Add `url` field to `Platform` interface**

Edit `sites/learn/src/lib/demo/platforms.ts`:

Add `url?: string` to the `Platform` interface:

```typescript
export interface Platform {
  id: string
  name: string
  description: string
  icon: string
  iconFallback: string
  live: boolean
  url?: string // external demo URL for live platforms
  modes: string[]
  capabilities: string[]
  adapterPackage: string
}
```

- [ ] **Step 2: Mark firebase and convex as live with demo URLs**

In the `PLATFORMS` array, update firebase and convex entries:

```typescript
{
  id: 'firebase',
  name: 'Firebase',
  description: 'Google cloud auth with Firestore security rules',
  icon: 'i-auth-firebase',
  iconFallback: 'bg-orange-500',
  live: true,
  url: 'https://firebase.demo.kavach.dev',
  modes: ['password', 'magic', 'social'],
  capabilities: ['Email + password', 'Magic link (OTP)', 'Google OAuth', 'Firestore security rules', 'Structured logging'],
  adapterPackage: '@kavach/adapter-firebase'
},
```

```typescript
{
  id: 'convex',
  name: 'Convex',
  description: 'Reactive database with built-in auth',
  icon: 'i-app-shield',
  iconFallback: 'bg-purple-600',
  live: true,
  url: 'https://convex.demo.kavach.dev',
  // Note: modes changed from ['password'] to ['social'] — Convex demo uses Google OAuth only
  // (password auth requires Convex Auth backend which is not configured in the demo)
  modes: ['social'],
  capabilities: ['Google OAuth', 'Reactive data queries', 'Server-side auth functions', 'Structured logging'],
  adapterPackage: '@kavach/adapter-convex'
},
```

- [ ] **Step 3: Add "Launch demo" link for live platforms in `+page.svelte`**

In `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`, find the closing `{/if}` of the live/mock badge block (the block that starts with `{#if platform?.live}` / `{:else}` / `{/if}`). Insert the "Launch demo" link immediately after that `{/if}`:

```svelte
{#if platform?.live && platform?.url}
  <a
    href={platform.url}
    target="_blank"
    rel="noopener noreferrer"
    class="bg-primary mt-2 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
  >
    Launch demo →
  </a>
{/if}
```

- [ ] **Step 4: Run unit tests**

```bash
NODE_NO_WARNINGS=1 bunx vitest run --config config/vitest.config.js
```

Expected: all tests pass

- [ ] **Step 5: Run learn site e2e tests**

```bash
cd sites/learn && npm run test:integration
```

Expected: all e2e tests pass

- [ ] **Step 6: Commit**

```bash
git add sites/learn/src/lib/demo/platforms.ts \
        sites/learn/src/routes/\(demo\)/demo/\[platform\]/+page.svelte
git commit -m "feat(learn): mark firebase + convex demos live, add launch links"
```

---

## Notes for deployers

**Vercel setup (manual step — not automated):**

1. Create three Vercel projects from the same repo, each pointing at `sites/demo` as root directory
2. Set per-project env vars:

| Project              | `KAVACH_ADAPTER` | `PUBLIC_KAVACH_ADAPTER` | Domain                     |
| -------------------- | ---------------- | ----------------------- | -------------------------- |
| kavach-demo-supabase | `supabase`       | `supabase`              | `supabase.demo.kavach.dev` |
| kavach-demo-firebase | `firebase`       | `firebase`              | `firebase.demo.kavach.dev` |
| kavach-demo-convex   | `convex`         | `convex`                | `convex.demo.kavach.dev`   |

3. Add adapter-specific env vars per project (Supabase URL/anon key, Firebase config, Convex URL)
4. Update `platforms.ts` URLs once domains are confirmed

**Firebase emulator for local testing:**

```bash
cd sites/demo
KAVACH_ADAPTER=firebase bun run emulators
# In another terminal:
KAVACH_ADAPTER=firebase PUBLIC_KAVACH_ADAPTER=firebase bun run dev
```

**Convex local for local testing:**

```bash
cd sites/demo
# First time: bunx convex dev (requires Convex account + project)
KAVACH_ADAPTER=convex PUBLIC_KAVACH_ADAPTER=convex bun run dev
```
