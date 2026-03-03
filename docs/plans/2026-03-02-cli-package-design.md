# CLI Package Design

## Overview

`@kavach/cli` is a two-part package: a CLI tool for scaffolding kavach into SvelteKit projects, and a Vite plugin that reads `kavach.config.js` to provide virtual modules at dev/build time.

## Architecture

### Two parts, one package

1. **CLI** (`npx @kavach/cli init`, `add`) — interactive scaffolding with surgical file patching
2. **Vite plugin** (`@kavach/cli/vite`) — reads `kavach.config.js`, exposes `$kavach/*` virtual modules

No separate `update` command needed — the Vite plugin reads the config on every dev server start. Change the config, restart, done.

## Config file

`kavach.config.js` at project root. Single source of truth.

```js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'github', label: 'Continue with GitHub' },
    { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
    { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
    { mode: 'password', name: 'email', label: 'Sign in using' }
  ],
  cachedLogins: true,
  logging: {
    level: 'info',
    table: 'audit.logs'
  },
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  },
  routes: {
    auth: '(public)/auth',
    data: '(server)/data',
    logout: '/logout'
  },
  rules: [
    { path: '/public', public: true },
    { path: '/data', roles: '*' },
    { path: '/admin', roles: ['admin'] }
  ]
}
```

### `logging`

Controls the logger setup in the `$kavach/auth` virtual module.

| Field | Default | Notes |
|-------|---------|-------|
| `level` | `'error'` | One of: error, warn, info, debug, trace |
| `table` | `'logs'` | Supports `schema.table` format (e.g. `'audit.logs'`) |

The Vite plugin generates logger initialization code using these values. At runtime the logger writes to the adapter's log writer (e.g. Supabase table).

### `env`

Maps adapter config keys to environment variable names. Each adapter has sensible defaults.

| Adapter | Key | Default env var |
|---------|-----|-----------------|
| supabase | `url` | `PUBLIC_SUPABASE_URL` |
| supabase | `anonKey` | `PUBLIC_SUPABASE_ANON_KEY` |

The CLI uses `env` to know which vars to append to `.env`. The Vite plugin uses it to generate `import { env } from '$env/dynamic/public'` lookups in `$kavach/auth`.

## Vite plugin

Import: `import { kavach } from '@kavach/cli/vite'`

Reads `kavach.config.js` and provides virtual modules:

| Module | Provides | Consumed by |
|--------|----------|-------------|
| `$kavach/auth` | Pre-wired kavach instance, adapter, logger | `hooks.server.js`, `+layout.svelte` |
| `$kavach/config` | Parsed config (adapter, providers, cached logins) | Auth page, layout |
| `$kavach/routes` | Route protection rules, route paths | `hooks.server.js` |
| `$kavach/providers` | Provider array for auth page | Auth `+page.svelte` |

### vite.config.js integration

```js
import { kavach } from '@kavach/cli/vite'
import { sveltekit } from '@sveltejs/kit/vite'

export default {
  plugins: [kavach(), sveltekit()]
}
```

### hooks.server.js consumption

```js
import { kavach } from '$kavach/auth'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(kavach.handle)
```

## CLI commands

### `init`

Interactive setup. Assumes SvelteKit project exists (from `sv create` or similar).

**Prompts:**
1. Which adapter? (supabase — extensible later)
2. Which auth providers? (multi-select: Google, GitHub, Azure, Magic Link, Password)
3. Enable cached logins? (y/n)
4. Log level? (default: `error`)
5. Log table? (default: `logs`)
6. Auth route path? (default: `(public)/auth`)
7. Data route path? (default: `(server)/data`)
8. Logout route path? (default: `/logout`)
9. Route protection rules? (default: `/public` public, everything else authenticated)

**Files generated/patched:**

| File | Action | Notes |
|------|--------|-------|
| `kavach.config.js` | Create | Single source of truth |
| `vite.config.js` | Patch | Add `kavach()` plugin via AST |
| `src/hooks.server.js` | Patch | Import from `$kavach/auth`, add to `sequence()` |
| `src/routes/+layout.server.js` | Patch | Add `locals.session` to load return |
| `src/routes/+layout.svelte` | Patch | Add kavach context + onAuthChange |
| `<auth-route>/+page.svelte` | Create | Auth page with selected providers. `AuthPage` if cached logins, `AuthProvider` list otherwise. |
| `<data-route>/[...slug]/+server.js` | Create | Data CRUD endpoint (GET/POST/PUT/DELETE) |
| `.env` | Append | Adapter env vars (never overwrite existing) |
| `package.json` | Patch | Install deps via detected package manager |

### `add auth-page`

Generates/regenerates the auth page from `kavach.config.js`. Uses provider list and cached logins flag.

### `add routes`

Generates/regenerates the data CRUD endpoint and route protection setup from `kavach.config.js`.

## File patching strategy

**Surgical, not destructive.** The CLI uses `magicast` for AST-based JS/TS transforms:

- **`vite.config.js`**: Add `kavach()` to the plugins array. Leave everything else.
- **`hooks.server.js`**: Add import, wrap existing handle in `sequence()` if not already sequenced.
- **`+layout.server.js`**: Add `locals.session` to the return object. Create load function if missing.
- **`+layout.svelte`**: Add onMount block with kavach setup. Merge into existing onMount if present.
- **`.env`**: Append only. Check each var — skip if already present.
- **New files**: Create only if path doesn't exist. If it exists, warn and ask per-file.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@clack/prompts` | Interactive CLI prompts |
| `magicast` | AST-based JS/TS file transforms |
| `picocolors` | Terminal colors |

## Verification plan

1. **New project**: Run `sv create`, then `npx @kavach/cli init`, verify auth works end-to-end
2. **Existing project**: Run on `sites/demo/` to migrate to config + Vite plugin, run existing tests

## Scope

### Phase 1 (this story)
- `init` command with Supabase adapter
- Vite plugin with virtual modules
- Surgical file patching
- Auth page generation
- Data route generation
- Verification on new + existing project

### Future
- Additional adapters (Firebase, Auth0, Amplify, Convex)
- `add` subcommands for granular updates
- TypeScript support in generated files
- `sv create` plugin integration
