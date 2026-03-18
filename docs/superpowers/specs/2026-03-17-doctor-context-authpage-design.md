# Design: Doctor — checkContextSetup + checkAuthPage

**Date:** 2026-03-17
**Status:** Approved

---

## Problem

`kavach doctor` currently verifies the server-side setup (hooks, layout.server, vite, env, deps) but does not detect two common client-side misconfiguration failures:

1. **Missing `setContext('kavach', kavach)` in an app layout** — causes `getContext('kavach')` inside `AuthProvider` to return `undefined`, breaking all auth UI.
2. **Missing auth page** — the page at `config.routes.auth` either doesn't exist or doesn't render `AuthProvider`, so users are redirected to a dead route.

Both failures are silent at build time and only surface at runtime.

---

## Scope

Two new checks added to `checks.js`, one new patcher added to `patchers.js`, and the corresponding fix methods added to `DoctorCommand`. No changes to config format or existing checks.

---

## Architecture

### Check 1: `checkContextSetup(cwd)`

**What it checks:**
Scans all `+layout.svelte` and `+layout@.svelte` files anywhere under `src/routes/`. Passes if _any_ of them contains `setContext('kavach'`.

**Rationale:** The setContext call can legitimately live in a route-group layout (e.g., `(app)/+layout@.svelte`) or the root layout. We only care that it exists somewhere — we don't need to know which group.

**Result shape:**

```js
{ id: 'layout-svelte', ok: false, label: '+layout.svelte', message: 'setContext(\'kavach\') missing', hint: 'Run kavach doctor --fix', fixable: true }
```

**Fix target:** Root `src/routes/+layout.svelte`. If the file exists, patch it; if not, generate a minimal one. This is the safest default — apps with a grouped layout already pass the check, so the fix only fires for apps that have _no_ setContext anywhere.

---

### Check 2: `checkAuthPage(cwd, config)`

**What it checks:**
Derives a search pattern from `config.routes.auth` (e.g., `/auth` → segment `auth`). Globs for `src/routes/**/auth/+page.svelte` to handle route groups (e.g., `(public)/auth/+page.svelte`). Passes if any match contains `AuthProvider`.

**Note:** Route group prefixes like `(public)` don't appear in `routes.auth` because they don't affect URLs. The glob approach finds the file regardless of how many route groups wrap it.

**Result shape:**

```js
{ id: 'auth-page', ok: false, label: 'auth page', message: 'not found', hint: 'Run kavach doctor --fix', fixable: true }
// or when found but missing AuthProvider:
{ id: 'auth-page', ok: false, label: 'auth/+page.svelte', message: 'AuthProvider missing', hint: 'Run kavach doctor --fix', fixable: true, path }
```

**Fix:** Call the existing `generateAuthPage(config)` from `generators.js` and write to `src/routes/{auth-segment}/+page.svelte`. The `writeFile` utility already creates parent directories.

---

### New Patcher: `patchLayoutSvelte(content)`

**Idempotency guard:** Returns `content` unchanged if `setContext('kavach'` is already present.

**Case 1 — empty or no `<script>` block:**
Generates a complete minimal layout:

```svelte
<script>
  import { setContext, onMount } from 'svelte'
  import { page } from '$app/stores'

  let { children } = $props()

  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { createKavach } = await import('kavach')
    const { adapter, logger } = await import('$kavach/auth')
    const { invalidateAll } = await import('$app/navigation')
    const instance = createKavach(adapter, { logger, invalidateAll })
    Object.assign(kavach, instance)
    instance.onAuthChange($page.url)
  })
</script>

{@render children()}
```

**Case 2 — existing `<script>` block present:**

1. Inject `import { setContext, onMount } from 'svelte'` and `import { page } from '$app/stores'` after the `<script>` opening tag (only imports not already present)
2. Inject the kavach setup block (const + setContext + onMount) before `</script>`

Implementation uses regex string manipulation (same approach as `patchHooksServer`/`patchLayoutServer`), not magicast — Svelte files are not valid JS modules.

---

### DoctorCommand Integration

Two new private fix methods mirror the existing pattern:

```js
#fixContextSetup(result) {
  const path = resolve(this.#cwd, 'src/routes/+layout.svelte')
  writeFile(path, patchLayoutSvelte(fileExists(path) ? readFile(path) : ''))
  return { ...result, ok: true, message: 'patched', fixed: true }
}

#fixAuthPage(result) {
  const path = result.path ?? this.#deriveAuthPagePath()
  writeFile(path, generateAuthPage(this.#config))
  return { ...result, ok: true, message: 'generated', fixed: true }
}
```

Run order in `#runChecks()` — inserted after `checkLayout` (server):

```
checkConfig → checkVite → checkHooks → checkLayout → checkContextSetup → checkAuthPage → checkEnvKeys → checkEnvValues → checkDeps
```

Both checks receive `config` because `checkAuthPage` needs `config.routes.auth`.

---

## Error Handling

- `checkContextSetup`: if `src/routes/` doesn't exist at all, returns `ok: false, fixable: true` with `message: 'not found'`
- `checkAuthPage`: if `config.routes?.auth` is undefined, returns `ok: true, message: 'no auth route configured', fixable: false` (same skip pattern as `checkEnvKeys` when env is empty)

---

## Testing

### `checks.spec.js` additions — `checkContextSetup`

- Fails when no layout files exist under `src/routes/`
- Fails when layouts exist but none has `setContext('kavach'`
- Passes when root `+layout.svelte` has `setContext('kavach'`
- Passes when a nested `(app)/+layout@.svelte` has `setContext('kavach'` (but root doesn't)

### `checks.spec.js` additions — `checkAuthPage`

- Passes when no auth route configured (no `config.routes`)
- Fails when derived path does not exist
- Fails when file exists but `AuthProvider` is absent
- Passes when file contains `AuthProvider`
- Passes when auth page is in a route group (`(public)/auth/+page.svelte`)

### `patchers.spec.js` additions — `patchLayoutSvelte`

- Generates minimal layout when content is empty
- Injects setContext into existing `<script>` block
- Is idempotent when `setContext('kavach'` already present

### `doctor.spec.js` additions

- `scaffold()` extended to write a valid `+layout.svelte` and auth page by default
- Tests that missing layout svelte is detected and fixed
- Tests that missing auth page is detected and fixed

---

## Files Modified

| File                                  | Change                                     |
| ------------------------------------- | ------------------------------------------ |
| `packages/cli/src/checks.js`          | Add `checkContextSetup`, `checkAuthPage`   |
| `packages/cli/src/patchers.js`        | Add `patchLayoutSvelte`                    |
| `packages/cli/src/commands/doctor.js` | Wire checks + fix methods, update imports  |
| `packages/cli/spec/checks.spec.js`    | New test blocks for both checks            |
| `packages/cli/spec/patchers.spec.js`  | New test block for `patchLayoutSvelte`     |
| `packages/cli/spec/doctor.spec.js`    | Extend `scaffold()`, add integration tests |
