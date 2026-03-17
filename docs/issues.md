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

**Workaround (sensei dashboard):** Auth bypassed with `export const handle: Handle = ({ event, resolve }) => resolve(event)`. Also has machine-specific `resolve.alias` in `vite.config.ts` that must be removed.

**To fix in kavach (root cause — still open):**
Update `package.json` exports to point to pre-built `.js` files instead of `.ts` source. This affects the `$kavach/auth` virtual module too (which imports `from 'kavach'` internally). Options:

1. Add a build step that emits `dist/index.js` and update exports: `"import": "./dist/index.js"`
2. Or add `node` export condition pointing to built JS alongside the `svelte` condition
3. Or make the `@kavach/vite` plugin add `ssr: { noExternal: ['kavach', /@kavach\/.*/] }` in its `config()` hook so Vite always bundles kavach rather than externalizing it
