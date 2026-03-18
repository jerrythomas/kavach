# Doctor checkContextSetup + checkAuthPage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new `kavach doctor` checks — `checkContextSetup` and `checkAuthPage` — with `--fix` support to catch missing client-side auth setup that currently fails silently at runtime.

**Architecture:** New check functions in `checks.js`, a new patcher in `patchers.js`, and two new fix methods wired into `DoctorCommand`. All follow the existing patterns exactly. Tests first throughout — write failing test, verify it fails, implement, verify it passes, commit.

**Tech Stack:** JavaScript (ESM), Vitest, Node `fs` (`readdirSync`), existing `readFile`/`writeFile`/`fileExists` utilities from `./fs.js`.

---

## Chunk 1: patchLayoutSvelte

### Task 1: Write failing tests for `patchLayoutSvelte`

**Files:**

- Modify: `packages/cli/spec/patchers.spec.js`

- [ ] **Step 1: Add `patchLayoutSvelte` to the import in `patchers.spec.js`**

Change the existing import at the top of the file:

```js
import {
  patchViteConfig,
  patchHooksServer,
  patchLayoutServer,
  patchEnvFile,
  patchLayoutSvelte
} from '../src/patchers.js'
```

- [ ] **Step 2: Add the test block after the existing `describe('patchEnvFile', ...)` block**

```js
describe('patchLayoutSvelte', () => {
  it('generates a minimal layout when content is empty', () => {
    const output = patchLayoutSvelte('')
    expect(output).toContain("setContext('kavach'")
    expect(output).toContain('createKavach')
    expect(output).toContain('{@render children()}')
  })

  it('generates a minimal layout when no <script> block is present', () => {
    const input = '<div>{@render children()}</div>'
    const output = patchLayoutSvelte(input)
    expect(output).toContain("setContext('kavach'")
    expect(output).toContain('createKavach')
  })

  it('injects kavach setup into an existing <script> block', () => {
    const input = `<script>\n\timport 'uno.css'\n</script>\n\n{@render children()}`
    const output = patchLayoutSvelte(input)
    expect(output).toContain("setContext('kavach'")
    expect(output).toContain('createKavach')
    expect(output).toContain("import 'uno.css'")
  })

  it('injects kavach setup into an existing <script lang="ts"> block', () => {
    const input = `<script lang="ts">\n\timport 'uno.css'\n</script>\n\n{@render children()}`
    const output = patchLayoutSvelte(input)
    expect(output).toContain("setContext('kavach'")
    expect(output).toContain('createKavach')
  })

  it('is idempotent when setContext already present', () => {
    const input = `<script>\n\timport { setContext } from 'svelte'\n\tsetContext('kavach', {})\n</script>`
    const output = patchLayoutSvelte(input)
    expect(output).toBe(input)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd packages/cli && bun run test spec/patchers.spec.js
```

Expected: `patchLayoutSvelte is not a function` (import error — the export doesn't exist yet).

---

### Task 2: Implement `patchLayoutSvelte`

**Files:**

- Modify: `packages/cli/src/patchers.js`

- [ ] **Step 4: Add `patchLayoutSvelte` to the end of `patchers.js`**

```js
const KAVACH_SETUP = `
	const kavach = $state({})
	setContext('kavach', kavach)

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')
		const instance = createKavach(adapter, { logger, invalidateAll })
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
	})`

const KAVACH_MINIMAL_LAYOUT = `<script>
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'

	let { children } = $props()
${KAVACH_SETUP}
</script>

{@render children()}
`

export function patchLayoutSvelte(content) {
  if (content.includes("setContext('kavach'")) return content

  // No <script> block — generate a complete minimal layout
  const scriptMatch = content.match(/<script(\s[^>]*)?>/)
  if (!content.trim() || !scriptMatch) {
    return KAVACH_MINIMAL_LAYOUT
  }

  const scriptTag = scriptMatch[0]
  let result = content

  // Inject missing svelte imports after the opening <script> tag
  if (!content.includes('setContext') && !content.includes('onMount')) {
    result = result.replace(
      scriptTag,
      `${scriptTag}\n\timport { setContext, onMount } from 'svelte'`
    )
  } else if (!content.includes('setContext')) {
    result = result.replace(scriptTag, `${scriptTag}\n\timport { setContext } from 'svelte'`)
  } else if (!content.includes('onMount')) {
    result = result.replace(scriptTag, `${scriptTag}\n\timport { onMount } from 'svelte'`)
  }

  if (!content.includes("from '$app/stores'")) {
    result = result.replace(scriptTag, `${scriptTag}\n\timport { page } from '$app/stores'`)
  }

  // Inject kavach setup before closing </script>
  result = result.replace('</script>', `${KAVACH_SETUP}\n</script>`)

  return result
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages/cli && bun run test spec/patchers.spec.js
```

Expected: All `patchLayoutSvelte` tests pass. All previously passing tests (4 describe blocks) still pass.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/patchers.js packages/cli/spec/patchers.spec.js
git commit -m "feat(cli): add patchLayoutSvelte for injecting kavach context setup"
```

---

## Chunk 2: checkContextSetup and checkAuthPage

### Task 3: Write failing tests for `checkContextSetup`

**Files:**

- Modify: `packages/cli/spec/checks.spec.js`

- [ ] **Step 1: Add the two new check functions to the import**

Change the import at the top of `checks.spec.js`:

```js
import {
  checkConfig,
  checkVite,
  checkHooks,
  checkLayout,
  checkEnvKeys,
  checkEnvValues,
  checkDeps,
  checkContextSetup,
  checkAuthPage
} from '../src/checks.js'
```

- [ ] **Step 2: Add failing test block for `checkContextSetup` after `describe('checkLayout', ...)`**

```js
describe('checkContextSetup', () => {
  it('fails when no layout files exist under src/routes/', () => {
    const r = checkContextSetup(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
    expect(r.id).toBe('layout-svelte')
  })

  it('fails when layout exists but has no setContext call', () => {
    writeFileSync(join(tmp, 'src/routes/+layout.svelte'), `<script>\n\timport 'uno.css'\n</script>`)
    const r = checkContextSetup(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it("passes when root +layout.svelte has setContext('kavach')", () => {
    writeFileSync(
      join(tmp, 'src/routes/+layout.svelte'),
      `<script>\n\tsetContext('kavach', {})\n</script>`
    )
    const r = checkContextSetup(tmp)
    expect(r.ok).toBe(true)
  })

  it("passes when a nested layout has setContext('kavach') but root does not", () => {
    mkdirSync(join(tmp, 'src/routes/(app)'), { recursive: true })
    writeFileSync(
      join(tmp, 'src/routes/(app)/+layout@.svelte'),
      `<script>\n\tsetContext('kavach', kavach)\n</script>`
    )
    const r = checkContextSetup(tmp)
    expect(r.ok).toBe(true)
  })
})
```

Note: `mkdirSync` is already imported in the file (`import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'`) — and `join` is imported from `'path'`.

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd packages/cli && bun run test spec/checks.spec.js
```

Expected: `checkContextSetup is not a function`.

---

### Task 4: Write failing tests for `checkAuthPage`

**Files:**

- Modify: `packages/cli/spec/checks.spec.js`

- [ ] **Step 4: Add test block for `checkAuthPage` after `describe('checkContextSetup', ...)`**

```js
describe('checkAuthPage', () => {
  const config = { routes: { auth: '/auth' } }

  it('passes when no routes config present', () => {
    const r = checkAuthPage(tmp, {})
    expect(r.ok).toBe(true)
    expect(r.fixable).toBe(false)
  })

  it('fails when auth page does not exist', () => {
    const r = checkAuthPage(tmp, config)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
    expect(r.id).toBe('auth-page')
  })

  it('fails when auth page exists but lacks AuthProvider', () => {
    mkdirSync(join(tmp, 'src/routes/auth'), { recursive: true })
    writeFileSync(join(tmp, 'src/routes/auth/+page.svelte'), '<div>Login</div>')
    const r = checkAuthPage(tmp, config)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('passes when auth page contains AuthProvider', () => {
    mkdirSync(join(tmp, 'src/routes/auth'), { recursive: true })
    writeFileSync(
      join(tmp, 'src/routes/auth/+page.svelte'),
      `<script>\n\timport { AuthProvider } from '@kavach/ui'\n</script>\n<AuthProvider name="email" />`
    )
    const r = checkAuthPage(tmp, config)
    expect(r.ok).toBe(true)
  })

  it('passes when auth page is inside a route group', () => {
    mkdirSync(join(tmp, 'src/routes/(public)/auth'), { recursive: true })
    writeFileSync(
      join(tmp, 'src/routes/(public)/auth/+page.svelte'),
      `<AuthProvider name="email" />`
    )
    const r = checkAuthPage(tmp, config)
    expect(r.ok).toBe(true)
  })
})
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
cd packages/cli && bun run test spec/checks.spec.js
```

Expected: `checkAuthPage is not a function`.

---

### Task 5: Implement `checkContextSetup` and `checkAuthPage`

**Files:**

- Modify: `packages/cli/src/checks.js`

- [ ] **Step 6: Add `join` to the path import and add `readdirSync` from Node `fs`**

Change the top of `checks.js`:

```js
import { resolve, join } from 'path'
import { readdirSync } from 'fs'
import { readFile, fileExists } from './fs.js'
import { DEPENDENCIES, ADAPTER_DEPS } from './commands/constants.js'
```

- [ ] **Step 7: Add the two private helper functions and two exported check functions at the end of `checks.js`**

```js
function findLayoutSvelteFiles(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...findLayoutSvelteFiles(full))
      } else if (entry.name === '+layout.svelte' || entry.name.startsWith('+layout@')) {
        results.push(full)
      }
    }
  } catch {
    // dir doesn't exist — return empty
  }
  return results
}

function findAuthPageCandidates(dir, segment) {
  const results = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === segment) {
          const page = join(full, '+page.svelte')
          if (fileExists(page)) results.push(page)
        } else {
          results.push(...findAuthPageCandidates(full, segment))
        }
      }
    }
  } catch {
    // dir doesn't exist — return empty
  }
  return results
}

export function checkContextSetup(cwd) {
  const routesDir = resolve(cwd, 'src/routes')
  const layouts = findLayoutSvelteFiles(routesDir)

  if (layouts.length === 0) {
    return {
      id: 'layout-svelte',
      ok: false,
      label: '+layout.svelte',
      message: 'not found',
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }

  const hasContext = layouts.some((p) => readFile(p).includes("setContext('kavach'"))
  if (!hasContext) {
    return {
      id: 'layout-svelte',
      ok: false,
      label: '+layout.svelte',
      message: "setContext('kavach') missing",
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }

  return {
    id: 'layout-svelte',
    ok: true,
    label: '+layout.svelte',
    message: 'valid',
    fixable: false
  }
}

export function checkAuthPage(cwd, config) {
  if (!config?.routes?.auth) {
    return {
      id: 'auth-page',
      ok: true,
      label: 'auth page',
      message: 'no auth route configured',
      fixable: false
    }
  }

  const segment = config.routes.auth.replace(/^\//, '').split('/').pop()
  const routesDir = resolve(cwd, 'src/routes')
  const candidates = findAuthPageCandidates(routesDir, segment)

  if (candidates.length === 0) {
    return {
      id: 'auth-page',
      ok: false,
      label: 'auth page',
      message: 'not found',
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }

  const found = candidates.find((p) => readFile(p).includes('AuthProvider'))
  if (!found) {
    const label = candidates[0].replace(routesDir + '/', '')
    return {
      id: 'auth-page',
      ok: false,
      label,
      message: 'AuthProvider missing',
      hint: 'Run kavach doctor --fix',
      fixable: true,
      path: candidates[0]
    }
  }

  return { id: 'auth-page', ok: true, label: 'auth page', message: 'valid', fixable: false }
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd packages/cli && bun run test spec/checks.spec.js
```

Expected: All new `checkContextSetup` and `checkAuthPage` tests pass. All previously passing tests still pass.

- [ ] **Step 9: Commit**

```bash
git add packages/cli/src/checks.js packages/cli/spec/checks.spec.js
git commit -m "feat(cli): add checkContextSetup and checkAuthPage"
```

---

## Chunk 3: DoctorCommand wiring and integration tests

### Task 6: Extend scaffold and write failing integration tests

**Files:**

- Modify: `packages/cli/spec/doctor.spec.js`

- [ ] **Step 1: Update `validConfig` to include `routes`**

Change `validConfig` near the top of the file:

```js
const validConfig = {
  adapter: 'supabase',
  env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
  routes: { auth: '/auth' },
  rules: [{ path: '/', public: true }]
}
```

- [ ] **Step 2: Add `layoutSvelte` and `authPage` options to `scaffold()`**

Add two new optional entries at the end of the `scaffold()` function body, after the existing `opts.pkg` block:

```js
if (opts.layoutSvelte !== false) {
  writeFileSync(
    join(dir, 'src/routes/+layout.svelte'),
    opts.layoutSvelte ?? `<script>\n\tsetContext('kavach', {})\n</script>\n{@render children()}`
  )
}
if (opts.authPage !== false) {
  mkdirSync(join(dir, 'src/routes/auth'), { recursive: true })
  writeFileSync(
    join(dir, 'src/routes/auth/+page.svelte'),
    opts.authPage ?? `<AuthProvider name="email" />`
  )
}
```

- [ ] **Step 3: Add failing integration tests inside `describe('DoctorCommand', ...)`**

Insert these **before the closing `})` of the `describe('DoctorCommand', ...)` block** (which is the last line of the file):

```js
	it('reports missing setContext in layout.svelte as fixable', async () => {
		scaffold(tmp, { layoutSvelte: `<script>\n\timport 'uno.css'\n</script>` })
		const cmd = new DoctorCommand(tmp, false)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'layout-svelte')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('--fix patches +layout.svelte to add kavach context', async () => {
		scaffold(tmp, { layoutSvelte: `<script>\n\timport 'uno.css'\n</script>` })
		const cmd = new DoctorCommand(tmp, true)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'layout-svelte')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
	})

	it('reports missing auth page as fixable', async () => {
		scaffold(tmp, { authPage: false })
		const cmd = new DoctorCommand(tmp, false)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'auth-page')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('--fix generates auth page', async () => {
		scaffold(tmp, { authPage: false })
		const cmd = new DoctorCommand(tmp, true)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'auth-page')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
	})
}) // closes describe('DoctorCommand', ...)
```

- [ ] **Step 4: Run tests to verify new tests fail, existing tests still pass**

```bash
cd packages/cli && bun run test spec/doctor.spec.js
```

Expected: The 4 new tests fail with `Cannot read properties of undefined (reading 'ok')` — the check IDs don't appear in results because DoctorCommand hasn't been wired yet. All 5 existing tests pass (the scaffold changes in Step 2 provide `+layout.svelte` and auth page by default, so the existing "all passing" test remains green once checks are wired in Task 7).

---

### Task 7: Wire checks and fix methods into DoctorCommand

**Files:**

- Modify: `packages/cli/src/commands/doctor.js`

- [ ] **Step 5: Update imports in `doctor.js`**

Change the `checks.js` import to add the two new functions:

```js
import {
  checkConfig,
  checkVite,
  checkHooks,
  checkLayout,
  checkContextSetup,
  checkAuthPage,
  checkEnvKeys,
  checkEnvValues,
  checkDeps
} from '../checks.js'
```

Change the `patchers.js` import:

```js
import {
  patchViteConfig,
  patchHooksServer,
  patchLayoutServer,
  patchEnvFile,
  patchLayoutSvelte
} from '../patchers.js'
```

Add a new import for `generateAuthPage`:

```js
import { generateAuthPage } from '../generators.js'
```

- [ ] **Step 6: Insert two new check lines in `#runChecks()` after the `checkLayout` line**

```js
results.push(this.#applyFix(checkLayout(this.#cwd), (r) => this.#fixLayout(r)))
results.push(this.#applyFix(checkContextSetup(this.#cwd), (r) => this.#fixContextSetup(r)))
results.push(this.#applyFix(checkAuthPage(this.#cwd, this.#config), (r) => this.#fixAuthPage(r)))
results.push(this.#applyFix(checkEnvKeys(this.#cwd, this.#config), (r) => this.#fixEnvKeys(r)))
```

- [ ] **Step 7: Add two fix methods after `#fixLayout()`**

```js
	#fixContextSetup(result) {
		const path = resolve(this.#cwd, 'src/routes/+layout.svelte')
		writeFile(path, patchLayoutSvelte(fileExists(path) ? readFile(path) : ''))
		return { ...result, ok: true, message: 'patched', fixed: true }
	}

	#fixAuthPage(result) {
		const segment = this.#config.routes.auth.replace(/^\//, '').split('/').pop()
		const path = result.path ?? resolve(this.#cwd, `src/routes/${segment}/+page.svelte`)
		writeFile(path, generateAuthPage(this.#config))
		return { ...result, ok: true, message: 'generated', fixed: true }
	}
```

- [ ] **Step 8: Run all tests**

```bash
cd packages/cli && bun run test
```

Expected: All tests pass. The suite count increases by the new tests added across all 3 spec files.

- [ ] **Step 9: Commit**

```bash
git add packages/cli/src/commands/doctor.js packages/cli/spec/doctor.spec.js
git commit -m "feat(cli): wire checkContextSetup and checkAuthPage into DoctorCommand"
```
