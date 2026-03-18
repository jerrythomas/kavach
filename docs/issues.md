# Kavach Issues

## [2026-03-16] Package resolution fails in Vite 7 SSR runner

**Status: Fixed** — `@kavach/vite` plugin now returns `ssr: { noExternal: ['kavach', /@kavach\/.*/] }` from its `config()` hook. Kavach packages are always bundled by Vite rather than externalized to Node's native resolver, which rejects `.ts` extensions. Fixed in commit `04a6841`.

**Symptom:** `ERR_RESOLVE_PACKAGE_ENTRY_FAIL` when importing `kavach` in `hooks.server.ts` with Vite 7 + SvelteKit 2.

**Root cause:** `packages/auth/package.json` exports map points to TypeScript source:

```json
".": {
  "import": "./src/index.ts",
  "svelte": "./src/index.ts"
}
```

Vite 7's SSR module runner uses Node's native package resolution for externals, which refuses `.ts` file extensions in export conditions.

**Workaround (sensei dashboard — current state):** All kavach packages installed via `bun link` from local monorepo. `vite.config.ts` uses `resolve.alias` pointing to local source so Vite can transform `.ts` files:

```ts
resolve: {
  alias: {
    'kavach': '/Users/Jerry/Developer/kavach/packages/auth/src/index.ts',
    '@kavach/adapter-supabase': '/Users/Jerry/Developer/kavach/adapters/supabase/src/index.ts',
    '@kavach/query': '/Users/Jerry/Developer/kavach/packages/query/src/index.js',
  }
}
```

Note the alias paths are machine-specific and must be removed once the packages ship pre-built JS.

---

## [2026-03-17] Published tarballs missing source files

**Status: Fixed** — Audited all packages. Added `src/**/*.ts` to `files` in `kavach`, all adapters (`supabase`, `amplify`, `auth0`, `firebase`, `convex`). Added `src/**/*.svelte` + `src/**/*.ddl` to `@kavach/vite`. Added `src/**/*.svelte` to `@kavach/ui`. Fixed broken `exports.import` pointing to `.js` where only `.ts` exists in `supabase`, `amplify`, `auth0`, `firebase` adapters. Removed stale `provider.css` export from `@kavach/hashing`. Fixed in commits `5c8b062`, `f414bd3`, `8b22ed1`.

**Symptom:** Vite fails at startup or at runtime with missing file errors:

```
Error: ENOENT: no such file or directory, open '.../@kavach/vite/src/templates/auth-page-cached.svelte'
Error: Failed to load url ./AuthButton.svelte in .../@kavach/ui/src/index.js
```

---

## [2026-03-17] `app.login` config field ignored — sentry hardcodes `/auth`

**Status: Fixed** — `generate.js` now maps `routes.auth → login` and forwards `logout`, `data`, `rpc` to the `app` object passed to `createKavach`. Fixed in commit `8016c51`.

**Symptom:** Setting `app.login: '/login'` in `kavach.config.js` has no effect. Unauthenticated users are always redirected to `/auth`.

---

## [2026-03-17] `AuthProvider` / `AuthPage` require kavach Svelte context — not documented

**Status: Fixed** — `kavach doctor` now has two new checks with `--fix` support:

1. **`checkContextSetup`** — detects missing `setContext('kavach')` in any layout under `src/routes/`. Fix: patches root `+layout.svelte` (or generates one) via `patchLayoutSvelte`.
2. **`checkAuthPage`** — detects missing or broken auth page (no `AuthProvider`). Fix: regenerates via `generateAuthPage`.

Fixed in commits `1204af3`, `ff88573`, `2d6041a`, `2c57075`, `e50194d`.

**Symptom:** `TypeError: Cannot read properties of undefined (reading 'signIn')` when clicking sign-in in a custom auth page using `<AuthProvider>` from `@kavach/ui`.

**Root cause:** `AuthProvider.svelte` and `AuthPage.svelte` call `getContext('kavach')`. If no ancestor called `setContext('kavach', ...)`, the context is `undefined` and any method call throws.
