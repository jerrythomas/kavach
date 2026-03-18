# Kavach Issues

## [2026-03-16] Package resolution fails in Vite 7 SSR runner

**Symptom:** `ERR_RESOLVE_PACKAGE_ENTRY_FAIL` when importing `kavach` in `hooks.server.ts` with Vite 7 + SvelteKit 2.

**Root cause:** `packages/auth/package.json` exports map points to TypeScript source:

```json
".": {
  "import": "./src/index.ts",
  "svelte": "./src/index.ts"
}
```

Vite 7's SSR module runner uses Node's native package resolution for externals, which refuses `.ts` file extensions in export conditions.

**Attempted fixes:**

- `ssr.noExternal: ['kavach']` — didn't help; Vite transforms the package but Node still rejects `.ts` exports
- `resolve.alias: { kavach: '/path/to/src/index.ts' }` — bypasses package exports, Vite can now import, but `kavach` default import is `undefined`

**Second issue (integration error):** The sensei dashboard used `import kavach from 'kavach'` (default import) which doesn't exist — `packages/auth/src/index.ts` has only named exports. The correct integration does NOT import from `kavach` directly in `hooks.server.ts`. The `@kavach/vite` plugin generates the `$kavach/auth` virtual module which exports a pre-configured `kavach` instance. The correct pattern is:

```js
// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle
```

This requires `kavach.config.js` to have `adapter`, `env`, and `rules` configured, and `vite.config.js` to include `kavach()` plugin before `sveltekit()`.

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

Auth is fully enabled — hooks.server.ts uses `kavach.handle` via `$kavach/auth`. Note the alias paths are machine-specific and must be removed once the packages ship pre-built JS.

**To fix in kavach (root cause — still open):**
Update `package.json` exports to point to pre-built `.js` files instead of `.ts` source. This affects the `$kavach/auth` virtual module too (which imports `from 'kavach'` internally). Options:

1. Add a build step that emits `dist/index.js` and update exports: `"import": "./dist/index.js"`
2. Or add `node` export condition pointing to built JS alongside the `svelte` condition
3. Or make the `@kavach/vite` plugin add `ssr: { noExternal: ['kavach', /@kavach\/.*/] }` in its `config()` hook so Vite always bundles kavach rather than externalizing it

---

## [2026-03-17] Published tarballs missing source files

**Packages affected:** `kavach`, `@kavach/vite`, `@kavach/ui`, `@kavach/adapter-supabase`

**Symptom:** Vite fails at startup or at runtime with missing file errors:

```
Error: ENOENT: no such file or directory, open '.../@kavach/vite/src/templates/auth-page-cached.svelte'
Error: Failed to load url ./AuthButton.svelte in .../@kavach/ui/src/index.js
```

**Root cause:** `package.json` exports / `src/index.js` reference files that are not included in the published npm tarball. The `.npmignore` or `files` field in `package.json` is excluding source files that are still required at runtime.

Specific missing files per package:

| Package                    | Missing files                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `@kavach/vite`             | `src/templates/auth-page.svelte`, `src/templates/auth-page-cached.svelte`             |
| `@kavach/ui`               | `src/AuthButton.svelte` and potentially other `.svelte` components                    |
| `kavach`                   | `src/index.ts` (tarball only ships `src/kavach.js`; exports map points to `index.ts`) |
| `@kavach/adapter-supabase` | `src/index.ts` missing (tarball ships only `.d.ts` in dist + some `.ts` source)       |

**Workaround (sensei dashboard):** All affected packages switched to `link:` pointing to local kavach monorepo (`~/Developer/kavach`), with `resolve.alias` in `vite.config.ts` so Vite can transform the TS source.

**To fix in kavach:** Audit `package.json` `files` field in each package and ensure all files referenced by `exports`, `module`, and runtime `require`/`import` calls are included in the tarball.

---

## [2026-03-17] `app.login` config field ignored — sentry hardcodes `/auth`

**Symptom:** Setting `app.login: '/login'` in `kavach.config.js` has no effect. Unauthenticated users are always redirected to `/auth`.

**Root cause:** `packages/sentry/src/processor.js` hardcodes the default login path:

```js
login: '/auth',  // line 18
```

The `app` config from `kavach.config.js` is passed to `createKavach` as `{ home }` only — the `login` field is stripped in `generate.js`:

```js
const app = routes?.home ? { home: routes.home } : {}
```

So `app.login`, `app.logout`, `app.session`, and `app.data` from `kavach.config.js` are never forwarded to `createKavach`.

**To fix in kavach:** Either forward all `app` fields from config through `generate.js` to the `createKavach` call in the template, or document that `app.login` in `kavach.config.js` is not respected and the login route must be `/auth`.

---

## [2026-03-17] `AuthProvider` / `AuthPage` require kavach Svelte context — not documented

**Symptom:** `TypeError: Cannot read properties of undefined (reading 'signIn')` when clicking sign-in in a custom auth page using `<AuthProvider>` from `@kavach/ui`.

**Root cause:** `AuthProvider.svelte` and `AuthPage.svelte` call `getContext('kavach')` to get the kavach instance. If no ancestor component has called `setContext('kavach', ...)`, the context is `undefined` and any method call throws.

The `setContext` call is not shown in the `@kavach/ui` README or any generated scaffold. It is only visible in the kavach demo's `(app)/+layout@.svelte`.

**Required setup in consumer app:**

```svelte
<!-- +layout.svelte -->
<script>
  import { setContext, onMount } from 'svelte'
  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { createKavach } = await import('kavach')
    const { adapter, logger } = await import('$kavach/auth')
    const { invalidateAll } = await import('$app/navigation')
    const instance = createKavach(adapter, { logger, invalidateAll })
    Object.assign(kavach, instance)
    instance.onAuthChange(page.url)
  })
</script>
```

**To fix in kavach:** Document the required `setContext` pattern in `@kavach/ui` README and/or export a `KavachProvider` component that encapsulates `setContext` + `onMount` setup.

**Doctor check plan:** Add two new checks to `kavach doctor`:

1. **`checkContextSetup(config)`** — scan all `+layout.svelte` / `+layout@.svelte` under `src/routes/`, exclude layouts inside the auth route group (prefix from `routes.auth`), fail if none contain `setContext('kavach'`. Fix: `patchLayoutSvelte(content)` — inject `setContext` + `createKavach` init into `<script>` block (or generate root layout if missing).

2. **`checkAuthPage(config)`** — derive path from `routes.auth` (e.g. `(public)/auth` → `src/routes/(public)/auth/+page.svelte`), fail if missing or lacks `AuthProvider`. Fix: reuse existing `generateAuthPage(config)`.

Files to touch: `packages/cli/src/checks.js`, `packages/cli/src/patchers.js`, `packages/cli/src/commands/doctor.js`. Also update `docs/llms/auth.txt`, `docs/llms/cli.txt`, and `sites/learn` docs.
