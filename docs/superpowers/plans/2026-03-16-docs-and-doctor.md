# Docs Overhaul + kavach doctor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `kavach doctor [--fix]` CLI command and overhaul documentation site with correct nav structure, TableOfContents, and substantive content.

**Architecture:** Two independent chunks — CLI command in `packages/cli/`, docs in `sites/learn/`. Check logic extracted to `checks.js` for testability. Doc pages consolidated into larger pages with right-side TOC copied from rokkit pattern.

**Tech Stack:** Node.js (CLI), Svelte 5 / SvelteKit (learn site), Vitest (tests), @clack/prompts + picocolors (CLI UI), spawnSync (safe subprocess execution)

---

## Chunk 1: `kavach doctor` command

### Task 1: checks.js — extracted check functions

**Files:**

- Create: `packages/cli/src/checks.js`
- Create: `packages/cli/spec/checks.spec.js`

- [ ] **Step 1: Write failing tests**

```js
// packages/cli/spec/checks.spec.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  checkConfig,
  checkVite,
  checkHooks,
  checkLayout,
  checkEnvKeys,
  checkEnvValues,
  checkDeps
} from '../src/checks.js'

let tmp

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'kavach-checks-'))
  mkdirSync(join(tmp, 'src/routes'), { recursive: true })
})

afterEach(() => rmSync(tmp, { recursive: true, force: true }))

// --- checkConfig ---

describe('checkConfig', () => {
  it('fails when kavach.config.js is missing', () => {
    const r = checkConfig(tmp, null)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(false)
    expect(r.message).toMatch(/not found/)
  })

  it('fails when config could not be loaded', () => {
    writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
    const r = checkConfig(tmp, null)
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/could not be parsed/)
  })

  it('fails when adapter field is missing', () => {
    writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
    const r = checkConfig(tmp, { env: {}, rules: [] })
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/adapter/)
  })

  it('fails when env field is missing', () => {
    writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
    const r = checkConfig(tmp, { adapter: 'supabase', rules: [] })
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/env/)
  })

  it('fails when rules field is missing', () => {
    writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
    const r = checkConfig(tmp, { adapter: 'supabase', env: {} })
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/rules/)
  })

  it('passes with valid config', () => {
    writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
    const r = checkConfig(tmp, { adapter: 'supabase', env: {}, rules: [] })
    expect(r.ok).toBe(true)
  })
})

// --- checkVite ---

describe('checkVite', () => {
  it('fails when vite.config.js is missing', () => {
    const r = checkVite(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(false)
  })

  it('fails when kavach() plugin is absent', () => {
    writeFileSync(
      join(tmp, 'vite.config.js'),
      `import { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [sveltekit()] }`
    )
    const r = checkVite(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('passes when kavach() plugin present', () => {
    writeFileSync(
      join(tmp, 'vite.config.js'),
      `import { kavach } from '@kavach/vite'\nexport default { plugins: [kavach(), sveltekit()] }`
    )
    const r = checkVite(tmp)
    expect(r.ok).toBe(true)
  })

  it('detects vite.config.ts', () => {
    writeFileSync(
      join(tmp, 'vite.config.ts'),
      `import { kavach } from '@kavach/vite'\nexport default {}`
    )
    const r = checkVite(tmp)
    expect(r.ok).toBe(true)
    expect(r.label).toBe('vite.config.ts')
  })
})

// --- checkHooks ---

describe('checkHooks', () => {
  it('fails when hooks file is missing', () => {
    const r = checkHooks(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('fails when hooks imports directly from kavach', () => {
    writeFileSync(
      join(tmp, 'src/hooks.server.ts'),
      `import kavach from 'kavach'\nexport const handle = ({ event, resolve }) => resolve(event)`
    )
    const r = checkHooks(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('passes when hooks uses $kavach/auth and kavach.handle', () => {
    writeFileSync(
      join(tmp, 'src/hooks.server.ts'),
      `import { kavach } from '$kavach/auth'\nexport const handle = kavach.handle`
    )
    const r = checkHooks(tmp)
    expect(r.ok).toBe(true)
  })
})

// --- checkLayout ---

describe('checkLayout', () => {
  it('fails when layout.server is missing', () => {
    const r = checkLayout(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('fails when layout.server does not pass session', () => {
    writeFileSync(join(tmp, 'src/routes/+layout.server.ts'), `export function load() { return {} }`)
    const r = checkLayout(tmp)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
  })

  it('passes when layout.server passes locals.session', () => {
    writeFileSync(
      join(tmp, 'src/routes/+layout.server.ts'),
      `export function load({ locals }) { return { session: locals.session } }`
    )
    const r = checkLayout(tmp)
    expect(r.ok).toBe(true)
  })
})

// --- checkEnvKeys ---

describe('checkEnvKeys', () => {
  const config = { env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' } }

  it('passes when no env config', () => {
    const r = checkEnvKeys(tmp, {})
    expect(r.ok).toBe(true)
  })

  it('fails when .env is missing', () => {
    const r = checkEnvKeys(tmp, config)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
    expect(r.message).toMatch(/PUBLIC_SUPABASE_URL/)
  })

  it('fails when a key is absent from .env', () => {
    writeFileSync(join(tmp, '.env'), 'PUBLIC_SUPABASE_URL=https://x.supabase.co')
    const r = checkEnvKeys(tmp, config)
    expect(r.ok).toBe(false)
    expect(r.message).toMatch(/PUBLIC_SUPABASE_ANON_KEY/)
  })

  it('passes when all keys present (even if empty)', () => {
    writeFileSync(join(tmp, '.env'), 'PUBLIC_SUPABASE_URL=\nPUBLIC_SUPABASE_ANON_KEY=')
    const r = checkEnvKeys(tmp, config)
    expect(r.ok).toBe(true)
  })
})

// --- checkEnvValues ---

describe('checkEnvValues', () => {
  const config = { env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' } }

  it('fails when values are empty', () => {
    writeFileSync(join(tmp, '.env'), 'PUBLIC_SUPABASE_URL=\nPUBLIC_SUPABASE_ANON_KEY=')
    const r = checkEnvValues(tmp, config)
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(false)
  })

  it('passes when all values are set', () => {
    writeFileSync(
      join(tmp, '.env'),
      'PUBLIC_SUPABASE_URL=https://x.supabase.co\nPUBLIC_SUPABASE_ANON_KEY=abc123'
    )
    const r = checkEnvValues(tmp, config)
    expect(r.ok).toBe(true)
  })
})

// --- checkDeps ---

describe('checkDeps', () => {
  it('fails when package.json is missing', () => {
    const r = checkDeps(tmp, { adapter: 'supabase' })
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(false)
  })

  it('fails when kavach is not installed', () => {
    writeFileSync(join(tmp, 'package.json'), JSON.stringify({ dependencies: {} }))
    const r = checkDeps(tmp, { adapter: 'supabase' })
    expect(r.ok).toBe(false)
    expect(r.fixable).toBe(true)
    expect(r.message).toMatch(/kavach/)
  })

  it('passes when all required deps present', () => {
    writeFileSync(
      join(tmp, 'package.json'),
      JSON.stringify({
        dependencies: {
          kavach: '^1.0.0',
          '@kavach/ui': '^1.0.0',
          '@kavach/query': '^1.0.0',
          '@kavach/logger': '^1.0.0',
          '@kavach/adapter-supabase': '^1.0.0',
          '@supabase/supabase-js': '^2.0.0'
        }
      })
    )
    const r = checkDeps(tmp, { adapter: 'supabase' })
    expect(r.ok).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify all fail**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run packages/cli/spec/checks.spec.js
```

Expected: all tests fail with "Cannot find module '../src/checks.js'"

- [ ] **Step 3: Implement checks.js**

```js
// packages/cli/src/checks.js
import { resolve } from 'path'
import { readFile, fileExists } from './fs.js'
import { DEPENDENCIES, ADAPTER_DEPS } from './commands/constants.js'

export function checkConfig(cwd, config) {
  const configPath = resolve(cwd, 'kavach.config.js')
  if (!fileExists(configPath)) {
    return {
      id: 'config',
      ok: false,
      label: 'kavach.config.js',
      message: 'not found',
      hint: 'Run kavach init',
      fixable: false
    }
  }
  if (!config) {
    return {
      id: 'config',
      ok: false,
      label: 'kavach.config.js',
      message: 'could not be parsed',
      hint: 'Run kavach init',
      fixable: false
    }
  }
  const missing = ['adapter', 'env', 'rules'].filter((k) => !(k in config))
  if (missing.length > 0) {
    return {
      id: 'config',
      ok: false,
      label: 'kavach.config.js',
      message: `missing fields: ${missing.join(', ')}`,
      hint: 'Run kavach init',
      fixable: false
    }
  }
  return { id: 'config', ok: true, label: 'kavach.config.js', message: 'valid' }
}

export function checkVite(cwd) {
  const candidates = ['vite.config.ts', 'vite.config.js'].map((f) => resolve(cwd, f))
  const path = candidates.find((p) => fileExists(p))
  if (!path) {
    return {
      id: 'vite',
      ok: false,
      label: 'vite.config.js',
      message: 'not found',
      hint: 'Run kavach init',
      fixable: false
    }
  }
  const label = path.endsWith('.ts') ? 'vite.config.ts' : 'vite.config.js'
  const content = readFile(path)
  if (!content.includes("from '@kavach/vite'")) {
    return {
      id: 'vite',
      ok: false,
      label,
      message: 'kavach() plugin missing',
      hint: 'Run kavach doctor --fix',
      fixable: true,
      path
    }
  }
  return { id: 'vite', ok: true, label, message: 'valid' }
}

export function checkHooks(cwd) {
  const candidates = ['src/hooks.server.ts', 'src/hooks.server.js'].map((f) => resolve(cwd, f))
  const path = candidates.find((p) => fileExists(p))
  if (!path) {
    return {
      id: 'hooks',
      ok: false,
      label: 'hooks.server',
      message: 'not found',
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }
  const label = path.endsWith('.ts') ? 'hooks.server.ts' : 'hooks.server.js'
  const content = readFile(path)
  if (!content.includes('$kavach/auth') || !content.includes('kavach.handle')) {
    return {
      id: 'hooks',
      ok: false,
      label,
      message: "must import from '$kavach/auth' and export kavach.handle",
      hint: 'Run kavach doctor --fix',
      fixable: true,
      path
    }
  }
  return { id: 'hooks', ok: true, label, message: 'valid' }
}

export function checkLayout(cwd) {
  const candidates = ['src/routes/+layout.server.ts', 'src/routes/+layout.server.js'].map((f) =>
    resolve(cwd, f)
  )
  const path = candidates.find((p) => fileExists(p))
  if (!path) {
    return {
      id: 'layout',
      ok: false,
      label: '+layout.server',
      message: 'not found',
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }
  const label = path.endsWith('.ts') ? '+layout.server.ts' : '+layout.server.js'
  const content = readFile(path)
  if (!content.includes('locals.session')) {
    return {
      id: 'layout',
      ok: false,
      label,
      message: 'does not pass session from locals',
      hint: 'Run kavach doctor --fix',
      fixable: true,
      path
    }
  }
  return { id: 'layout', ok: true, label, message: 'valid' }
}

export function checkEnvKeys(cwd, config) {
  if (!config?.env || Object.keys(config.env).length === 0) {
    return { id: 'env-keys', ok: true, label: '.env', message: 'no env config' }
  }
  const envPath = resolve(cwd, '.env')
  const present = new Set()
  if (fileExists(envPath)) {
    readFile(envPath)
      .split('\n')
      .forEach((line) => {
        const key = line.split('=')[0].trim()
        if (key) present.add(key)
      })
  }
  const missing = Object.values(config.env).filter((k) => !present.has(k))
  if (missing.length > 0) {
    return {
      id: 'env-keys',
      ok: false,
      label: '.env',
      message: `missing keys: ${missing.join(', ')}`,
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }
  return { id: 'env-keys', ok: true, label: '.env', message: 'all keys present' }
}

export function checkEnvValues(cwd, config) {
  if (!config?.env || Object.keys(config.env).length === 0) {
    return { id: 'env-values', ok: true, label: '.env values', message: 'no env config' }
  }
  const envPath = resolve(cwd, '.env')
  const values = {}
  if (fileExists(envPath)) {
    readFile(envPath)
      .split('\n')
      .forEach((line) => {
        const idx = line.indexOf('=')
        if (idx > 0) values[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
      })
  }
  const empty = Object.values(config.env).filter((k) => !values[k])
  if (empty.length > 0) {
    return {
      id: 'env-values',
      ok: false,
      label: '.env',
      message: `empty values: ${empty.join(', ')}`,
      hint: empty.map((k) => `set ${k}=<your-value> in .env`).join('\n        '),
      fixable: false
    }
  }
  return { id: 'env-values', ok: true, label: '.env values', message: 'all values set' }
}

export function checkDeps(cwd, config) {
  const pkgPath = resolve(cwd, 'package.json')
  if (!fileExists(pkgPath)) {
    return {
      id: 'deps',
      ok: false,
      label: 'dependencies',
      message: 'package.json not found',
      fixable: false
    }
  }
  const pkg = JSON.parse(readFile(pkgPath))
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  const required = [...DEPENDENCIES, ...(ADAPTER_DEPS[config?.adapter] ?? [])]
  const missing = required.filter((d) => !(d in allDeps))
  if (missing.length > 0) {
    return {
      id: 'deps',
      ok: false,
      label: 'dependencies',
      message: `missing: ${missing.join(', ')}`,
      hint: 'Run kavach doctor --fix',
      fixable: true
    }
  }
  return { id: 'deps', ok: true, label: 'dependencies', message: 'all installed' }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run packages/cli/spec/checks.spec.js
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/checks.js packages/cli/spec/checks.spec.js
git commit -m "feat(cli): add check functions for kavach doctor"
```

---

### Task 2: doctor.js command

**Files:**

- Create: `packages/cli/src/commands/doctor.js`
- Create: `packages/cli/spec/doctor.spec.js`

- [ ] **Step 1: Write failing integration tests**

```js
// packages/cli/spec/doctor.spec.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { DoctorCommand } from '../src/commands/doctor.js'

let tmp

const validConfig = {
  adapter: 'supabase',
  env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
  rules: [{ path: '/', public: true }]
}

function scaffold(dir, opts = {}) {
  mkdirSync(join(dir, 'src/routes'), { recursive: true })
  if (opts.config !== false) {
    writeFileSync(join(dir, 'kavach.config.js'), `export default ${JSON.stringify(validConfig)}`)
  }
  if (opts.vite !== false) {
    writeFileSync(
      join(dir, 'vite.config.js'),
      opts.vite ??
        `import { kavach } from '@kavach/vite'\nexport default { plugins: [kavach(), sveltekit()] }`
    )
  }
  if (opts.hooks !== false) {
    writeFileSync(
      join(dir, 'src/hooks.server.js'),
      opts.hooks ?? `import { kavach } from '$kavach/auth'\nexport const handle = kavach.handle`
    )
  }
  if (opts.layout !== false) {
    writeFileSync(
      join(dir, 'src/routes/+layout.server.js'),
      opts.layout ?? `export function load({ locals }) { return { session: locals.session } }`
    )
  }
  if (opts.env !== false) {
    writeFileSync(
      join(dir, '.env'),
      opts.env ?? 'PUBLIC_SUPABASE_URL=https://x.supabase.co\nPUBLIC_SUPABASE_ANON_KEY=abc'
    )
  }
  if (opts.pkg !== false) {
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        dependencies: {
          kavach: '^1.0.0',
          '@kavach/ui': '^1.0.0',
          '@kavach/query': '^1.0.0',
          '@kavach/logger': '^1.0.0',
          '@kavach/adapter-supabase': '^1.0.0',
          '@supabase/supabase-js': '^2.0.0'
        }
      })
    )
  }
}

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'kavach-doctor-'))
})
afterEach(() => rmSync(tmp, { recursive: true, force: true }))

describe('DoctorCommand', () => {
  it('reports all passing for a valid project', async () => {
    scaffold(tmp)
    const cmd = new DoctorCommand(tmp, false)
    cmd._configForTest = validConfig
    const results = await cmd.runChecksForTest()
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('reports missing vite plugin as fixable', async () => {
    scaffold(tmp, {
      vite: `import { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [sveltekit()] }`
    })
    const cmd = new DoctorCommand(tmp, false)
    cmd._configForTest = validConfig
    const results = await cmd.runChecksForTest()
    const vite = results.find((r) => r.id === 'vite')
    expect(vite.ok).toBe(false)
    expect(vite.fixable).toBe(true)
  })

  it('--fix patches vite.config.js', async () => {
    scaffold(tmp, {
      vite: `import { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [sveltekit()] }`
    })
    const cmd = new DoctorCommand(tmp, true)
    cmd._configForTest = validConfig
    const results = await cmd.runChecksForTest()
    const vite = results.find((r) => r.id === 'vite')
    expect(vite.ok).toBe(true)
    expect(vite.fixed).toBe(true)
  })

  it('reports wrong hooks as fixable', async () => {
    scaffold(tmp, {
      hooks: `import kavach from 'kavach'\nexport const handle = ({ event, resolve }) => resolve(event)`
    })
    const cmd = new DoctorCommand(tmp, false)
    cmd._configForTest = validConfig
    const results = await cmd.runChecksForTest()
    const hooks = results.find((r) => r.id === 'hooks')
    expect(hooks.ok).toBe(false)
    expect(hooks.fixable).toBe(true)
  })

  it('reports empty env values as not fixable', async () => {
    scaffold(tmp, { env: 'PUBLIC_SUPABASE_URL=\nPUBLIC_SUPABASE_ANON_KEY=' })
    const cmd = new DoctorCommand(tmp, false)
    cmd._configForTest = validConfig
    const results = await cmd.runChecksForTest()
    const envVals = results.find((r) => r.id === 'env-values')
    expect(envVals.ok).toBe(false)
    expect(envVals.fixable).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify all fail**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run packages/cli/spec/doctor.spec.js
```

Expected: all fail with "Cannot find module"

- [ ] **Step 3: Implement doctor.js**

Note: Use `spawnSync` with array args (not `execSync` with string interpolation) to avoid shell injection.

```js
// packages/cli/src/commands/doctor.js
import { resolve } from 'path'
import { spawnSync } from 'child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
  checkConfig,
  checkVite,
  checkHooks,
  checkLayout,
  checkEnvKeys,
  checkEnvValues,
  checkDeps
} from '../checks.js'
import { patchViteConfig, patchHooksServer, patchLayoutServer, patchEnvFile } from '../patchers.js'
import { readFile, writeFile, fileExists, detectPackageManager } from '../fs.js'
import { DEPENDENCIES, ADAPTER_DEPS } from './constants.js'

export class DoctorCommand {
  #cwd
  #fix
  #config

  /** Set in tests to bypass dynamic import */
  _configForTest = null

  constructor(cwd = process.cwd(), fix = false) {
    this.#cwd = cwd
    this.#fix = fix
  }

  async run() {
    p.intro(pc.bgCyan(pc.black(` kavach doctor${this.#fix ? ' --fix' : ''} `)))
    await this.#loadConfig()
    const results = await this.#runChecks()
    this.#printResults(results)
    this.#printSummary(results)
  }

  /** Exposed for testing — skips p.intro/outro */
  async runChecksForTest() {
    if (this._configForTest) this.#config = this._configForTest
    return this.#runChecks()
  }

  async #loadConfig() {
    if (this._configForTest) {
      this.#config = this._configForTest
      return
    }
    const configPath = resolve(this.#cwd, 'kavach.config.js')
    if (!fileExists(configPath)) return
    try {
      const mod = await import(/* @vite-ignore */ configPath)
      this.#config = mod.default
    } catch {
      // checkConfig will report the parse failure
    }
  }

  async #runChecks() {
    const results = []

    const configResult = checkConfig(this.#cwd, this.#config)
    results.push(configResult)
    if (!configResult.ok) return results // remaining checks need a valid config

    results.push(this.#applyFix(checkVite(this.#cwd), (r) => this.#fixVite(r)))
    results.push(this.#applyFix(checkHooks(this.#cwd), (r) => this.#fixHooks(r)))
    results.push(this.#applyFix(checkLayout(this.#cwd), (r) => this.#fixLayout(r)))
    results.push(this.#applyFix(checkEnvKeys(this.#cwd, this.#config), (r) => this.#fixEnvKeys(r)))
    results.push(checkEnvValues(this.#cwd, this.#config)) // never auto-fixable
    results.push(this.#applyFix(checkDeps(this.#cwd, this.#config), (r) => this.#fixDeps(r)))

    return results
  }

  #applyFix(result, fixFn) {
    if (!result.ok && result.fixable && this.#fix) return fixFn(result)
    return result
  }

  #fixVite(result) {
    const path = result.path ?? resolve(this.#cwd, 'vite.config.js')
    writeFile(path, patchViteConfig(readFile(path)))
    return { ...result, ok: true, message: 'patched', fixed: true }
  }

  #fixHooks(result) {
    const ext = fileExists(resolve(this.#cwd, 'tsconfig.json')) ? 'ts' : 'js'
    const path = result.path ?? resolve(this.#cwd, `src/hooks.server.${ext}`)
    writeFile(path, patchHooksServer(fileExists(path) ? readFile(path) : ''))
    return { ...result, ok: true, message: 'patched', fixed: true }
  }

  #fixLayout(result) {
    const ext = fileExists(resolve(this.#cwd, 'tsconfig.json')) ? 'ts' : 'js'
    const path = result.path ?? resolve(this.#cwd, `src/routes/+layout.server.${ext}`)
    writeFile(path, patchLayoutServer(fileExists(path) ? readFile(path) : ''))
    return { ...result, ok: true, message: 'patched', fixed: true }
  }

  #fixEnvKeys(result) {
    const envPath = resolve(this.#cwd, '.env')
    const content = fileExists(envPath) ? readFile(envPath) : ''
    writeFile(envPath, patchEnvFile(content, this.#config.env))
    return { ...result, ok: true, message: 'missing keys added (values are empty)', fixed: true }
  }

  #fixDeps(result) {
    const pm = detectPackageManager(this.#cwd)
    const required = [...DEPENDENCIES, ...(ADAPTER_DEPS[this.#config?.adapter] ?? [])]
    const pkg = JSON.parse(readFile(resolve(this.#cwd, 'package.json')))
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
    const missing = required.filter((d) => !(d in allDeps))
    if (missing.length > 0) {
      // Use spawnSync with array args to avoid shell injection
      const [bin, ...baseArgs] = pm === 'bun' ? ['bun', 'add'] : ['npm', 'install']
      spawnSync(bin, [...baseArgs, ...missing], { cwd: this.#cwd, stdio: 'pipe' })
    }
    return { ...result, ok: true, message: 'installed', fixed: true }
  }

  #printResults(results) {
    p.log.message('')
    for (const r of results) {
      const icon = r.fixed ? pc.green('✔') : r.ok ? pc.green('✓') : pc.red('✗')
      p.log.message(`  ${icon} ${r.label} — ${r.message}`)
      if (!r.ok && !r.fixed && r.hint) {
        r.hint.split('\n').forEach((line) => p.log.message(`      ${pc.dim(line)}`))
      }
    }
    p.log.message('')
  }

  #printSummary(results) {
    const issues = results.filter((r) => !r.ok && !r.fixed)
    const fixed = results.filter((r) => r.fixed)

    if (issues.length === 0 && fixed.length === 0) {
      p.outro(pc.green('All checks passed. Your kavach setup looks healthy.'))
    } else if (issues.length === 0) {
      p.outro(pc.green(`${fixed.length} issue${fixed.length > 1 ? 's' : ''} fixed.`))
    } else if (!this.#fix) {
      p.outro(
        pc.yellow(
          `${issues.length} issue${issues.length > 1 ? 's' : ''} found. Run kavach doctor --fix to repair what can be fixed automatically.`
        )
      )
    } else {
      p.outro(
        pc.yellow(
          `${issues.length} issue${issues.length > 1 ? 's' : ''} require${issues.length === 1 ? 's' : ''} manual action — see above.`
        )
      )
    }
  }
}

export async function doctor(fix = false, cwd = process.cwd()) {
  const cmd = new DoctorCommand(cwd, fix)
  await cmd.run()
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run packages/cli/spec/doctor.spec.js
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/commands/doctor.js packages/cli/spec/doctor.spec.js
git commit -m "feat(cli): add DoctorCommand with check and fix logic"
```

---

### Task 3: Register doctor in CLI entry point

**Files:**

- Modify: `packages/cli/src/index.js`

- [ ] **Step 1: Update index.js**

```js
#!/usr/bin/env node
import { init } from './commands/init.js'
import { add } from './commands/add.js'
import { doctor } from './commands/doctor.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'init') await init()
else if (command === 'add') await add(args[0])
else if (command === 'doctor') await doctor(args.includes('--fix'))
else console.log('Usage: kavach <init|add auth-page|add routes|doctor [--fix]>')
```

- [ ] **Step 2: Run full CLI test suite**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run packages/cli/
```

Expected: all existing + new tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.js
git commit -m "feat(cli): register kavach doctor command"
```

---

## Chunk 2: Documentation site

### Task 4: Copy TableOfContents component

**Files:**

- Create: `sites/learn/src/lib/TableOfContents.svelte`

- [ ] **Step 1: Copy from rokkit with note**

Copy the file `/Users/Jerry/Developer/rokkit/site/src/lib/components/TableOfContents.svelte` verbatim to `sites/learn/src/lib/TableOfContents.svelte`, then prepend this comment as the very first line:

```svelte
<!-- Temporary local copy — remove once TableOfContents is exported from @rokkit/app -->
```

- [ ] **Step 2: Commit**

```bash
git add sites/learn/src/lib/TableOfContents.svelte
git commit -m "feat(learn): copy TableOfContents from rokkit (temporary until @rokkit/app exports it)"
```

---

### Task 5: Update docs layout — nav restructure + TOC sidebar

**Files:**

- Modify: `sites/learn/src/routes/(public)/docs/+layout.svelte`

- [ ] **Step 1: Rewrite layout**

```svelte
<script>
  import { List } from '@rokkit/ui'
  import { page } from '$app/stores'
  import TableOfContents from '$lib/TableOfContents.svelte'

  const docsItems = [
    { label: 'Why Kavach', value: '/docs/why-kavach' },
    { label: 'Quick Start', value: '/docs/quick-start' },
    { label: 'CLI', value: '/docs/cli' },
    { label: 'Core Concepts', value: '/docs/core-concepts' },
    {
      label: 'Adapters',
      children: [
        { label: 'Supabase', value: '/docs/adapters/supabase' },
        { label: 'Firebase', value: '/docs/adapters/firebase' },
        { label: 'Auth0', value: '/docs/adapters/auth0' },
        { label: 'Amplify', value: '/docs/adapters/amplify' },
        { label: 'Convex', value: '/docs/adapters/convex' }
      ]
    },
    {
      label: 'Reference',
      children: [
        { label: 'Configuration', value: '/docs/configuration' },
        { label: 'Vite Plugin', value: '/docs/plugins/vite' },
        { label: 'Sentry', value: '/docs/sentry' },
        { label: 'Logger', value: '/docs/logger' }
      ]
    }
  ]

  let { children } = $props()
  let selected = $derived($page.url.pathname)
</script>

<div class="bg-surface-z1 text-surface-z7 flex h-full">
  <aside class="border-surface-z3 w-64 overflow-y-auto border-r p-4">
    <List
      items={docsItems}
      value={selected}
      fields={{ label: 'label', children: 'children', href: 'value' }}
      collapsible={true}
    />
  </aside>
  <div class="flex min-w-0 flex-1 overflow-hidden">
    <main id="main-content" class="min-w-0 flex-1 overflow-y-auto p-8">
      {@render children()}
    </main>
    <aside
      class="border-surface-z3 hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-l px-5 py-6 xl:flex"
    >
      <TableOfContents />
    </aside>
  </div>
</div>
```

- [ ] **Step 2: Verify site builds**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | tail -10
```

Expected: build succeeds, no errors

- [ ] **Step 3: Commit**

```bash
git add sites/learn/src/routes/\(public\)/docs/+layout.svelte
git commit -m "feat(learn): restructure docs nav and add TableOfContents sidebar"
```

---

### Task 6: Why Kavach page

**Files:**

- Create: `sites/learn/src/routes/(public)/docs/why-kavach/+page.svelte`

- [ ] **Step 1: Create page**

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const swapCode = `// kavach.config.js — change one line to switch backends
export default {
  adapter: 'firebase',  // was 'supabase' — everything else stays the same
  providers: [...],
  rules: [...]
}`

  const flowCode = `kavach.config.js       adapter, providers, route rules, env var names
        ↓
@kavach/vite plugin    reads config, generates virtual module at build time
        ↓
$kavach/auth           exports: kavach (instance), adapter, logger
        ↓
kavach.handle          SvelteKit server hook — runs on every request
        ↓
sentry                 evaluates route rules against current session
        ↓
session cookie         httpOnly cookie stores access + refresh tokens
        ↓
event.locals.session   available in all load functions and server routes`

  const packages = [
    ['kavach', 'Core client — createKavach, session sync, auth state'],
    ['@kavach/vite', 'Vite plugin — generates $kavach/auth virtual module'],
    ['@kavach/sentry', 'Route protection engine — rules, roles, redirect logic'],
    ['@kavach/ui', 'Pre-built Svelte components — AuthPage, LoginCard, AuthButton'],
    ['@kavach/logger', 'Structured audit logging with adapter support'],
    ['@kavach/adapter-supabase', 'Supabase adapter (full capabilities)'],
    ['@kavach/adapter-firebase', 'Firebase adapter'],
    ['@kavach/adapter-auth0', 'Auth0 adapter'],
    ['@kavach/adapter-amplify', 'AWS Amplify / Cognito adapter'],
    ['@kavach/adapter-convex', 'Convex adapter']
  ]
</script>

<div class="max-w-4xl">
  <h1 class="mb-4 text-3xl font-bold">Why Kavach</h1>
  <p class="text-surface-z7 mb-8 text-lg">
    Drop-in authentication for SvelteKit with a unified API across backends.
  </p>

  <h2 class="mt-8 mb-3 text-xl font-semibold">The Problem</h2>
  <p class="text-surface-z7 mb-4">
    Adding auth to a SvelteKit app typically means scattered authentication checks across route
    files, tight coupling to a specific backend, and manual session management in every load
    function. Switching auth providers means rewriting auth logic throughout your app.
  </p>

  <h2 class="mt-8 mb-3 text-xl font-semibold">The Adapter Model</h2>
  <p class="text-surface-z7 mb-4">
    Kavach provides one interface for auth regardless of backend. Configure your adapter once in
    <code>kavach.config.js</code> — your route protection rules, session handling, and UI components stay
    the same when you swap backends.
  </p>
  <Code code={swapCode} language="js" />

  <h2 class="mt-8 mb-3 text-xl font-semibold">How It Works</h2>
  <p class="text-surface-z7 mb-4">
    The <code>@kavach/vite</code> plugin reads your config at build time and generates the
    <code>$kavach/auth</code> virtual module. You register <code>kavach.handle</code> as a SvelteKit hook
    — from that point, every request is protected according to your route rules.
  </p>
  <Code code={flowCode} language="text" />

  <h2 class="mt-8 mb-3 text-xl font-semibold">Key Packages</h2>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-surface-z3 border-b">
          <th class="py-2 pr-4">Package</th>
          <th class="py-2">Purpose</th>
        </tr>
      </thead>
      <tbody>
        {#each packages as [pkg, desc]}
          <tr class="border-surface-z3 border-b">
            <td class="py-2 pr-4"><code>{pkg}</code></td>
            <td class="text-surface-z6 py-2">{desc}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2 class="mt-8 mb-3 text-xl font-semibold">Next Steps</h2>
  <ul class="space-y-2">
    <li>
      <a href="/docs/quick-start" class="text-primary hover:underline"
        >Quick Start — get running in minutes</a
      >
    </li>
    <li><a href="/docs/cli" class="text-primary hover:underline">CLI reference</a></li>
    <li>
      <a href="/docs/core-concepts" class="text-primary hover:underline">Core concepts in depth</a>
    </li>
  </ul>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | grep -iE "error" | head -5
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add sites/learn/src/routes/\(public\)/docs/why-kavach/
git commit -m "feat(learn): add Why Kavach page with architecture overview"
```

---

### Task 7: Core Concepts page

**Files:**

- Create: `sites/learn/src/routes/(public)/docs/core-concepts/+page.svelte`

- [ ] **Step 1: Create page**

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const layoutCode = `<!-- src/routes/+layout.svelte -->
<script>
  import { setContext, onMount } from 'svelte'
  import { page } from '$app/stores'

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
<\/script>`

  const signInCode = `<script>
  import { getContext } from 'svelte'
  const kavach = getContext('kavach')
<\/script>

<!-- OAuth -->
<button onclick={() => kavach.signIn({ provider: 'google' })}>Continue with Google</button>

<!-- Email + password -->
<button onclick={() => kavach.signIn({ provider: 'email', email, password })}>Sign in</button>

<!-- Magic link -->
<button onclick={() => kavach.signIn({ provider: 'magic', email })}>Send magic link</button>

<button onclick={() => kavach.signOut()}>Sign out</button>`

  const rulesCode = `// kavach.config.js
export default {
  rules: [
    { path: '/auth',      public: true },       // no auth needed
    { path: '/',          public: true },
    { path: '/dashboard', protected: true },     // any authenticated user
    { path: '/admin',     roles: ['admin'] },    // specific role required
    { path: '/api',       roles: ['user', 'admin'] }
  ],
  roleHome: {
    admin: '/admin',     // where admins land after login
    user:  '/dashboard'
  }
}`

  const sessionChainCode = `// 1. kavach.handle parses the cookie and sets locals.session
// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle

// 2. Pass session to all pages via layout.server
// src/routes/+layout.server.js
export function load({ locals }) {
  return { session: locals.session }
}

// 3. Guard individual routes
// src/routes/dashboard/+page.server.js
import { redirect } from '@sveltejs/kit'
export function load({ locals }) {
  if (!locals.session) redirect(303, '/auth')
  return { user: locals.session.user }
}

// 4. Access in components via $page.data
// src/routes/+page.svelte
<script>
  import { page } from '$app/stores'
  $: user = $page.data.session?.user
<\/script>
<p>Hello {user?.email}</p>`

  const sessionShape = `{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    role: 'user'
  },
  access_token: 'jwt...',
  refresh_token: 'token...',
  expires_in: 3600
}`
</script>

<div class="max-w-4xl">
  <h1 class="mb-4 text-3xl font-bold">Core Concepts</h1>
  <p class="text-surface-z7 mb-8 text-lg">Authentication, authorization, and session management.</p>

  <!-- Authentication -->
  <h2 class="mt-8 mb-3 text-xl font-semibold">Authentication</h2>
  <p class="text-surface-z7 mb-4">
    Kavach supports OAuth (Google, GitHub, etc.), email + password, magic link (OTP), and passkey.
    You configure providers in <code>kavach.config.js</code> — the UI components and sign-in API work
    the same regardless of which you choose.
  </p>

  <h3 class="mt-6 mb-2 font-semibold">Client-side setup</h3>
  <p class="text-surface-z7 mb-3">
    Create a kavach instance in your root layout and share it via Svelte context. Must run in
    <code>onMount</code> — browser only.
  </p>
  <Code code={layoutCode} language="svelte" />

  <h3 class="mt-6 mb-2 font-semibold">Sign in / sign out</h3>
  <Code code={signInCode} language="svelte" />

  <h3 class="mt-6 mb-2 font-semibold">Auth flows</h3>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-surface-z3 border-b">
          <th class="py-2 pr-6">Flow</th>
          <th class="py-2 pr-6">Provider name</th>
          <th class="py-2">Notes</th>
        </tr>
      </thead>
      <tbody>
        {#each [['OAuth', 'google, github, azure, …', 'Redirect-based; adapter must support the provider'], ['Magic link', 'magic', 'OTP via email; set mode: "otp"'], ['Email + password', 'email', 'Set mode: "password"'], ['Passkey', 'passkey', 'WebAuthn; Supabase and Firebase only']] as [flow, name, note]}
          <tr class="border-surface-z3 border-b">
            <td class="py-2 pr-6">{flow}</td>
            <td class="py-2 pr-6"><code>{name}</code></td>
            <td class="text-surface-z6 py-2 text-sm">{note}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Authorization -->
  <h2 class="mt-10 mb-3 text-xl font-semibold">Authorization</h2>
  <p class="text-surface-z7 mb-4">
    Route protection is declared in <code>kavach.config.js</code> and enforced automatically by
    <code>kavach.handle</code> on every request. No per-route auth checks needed.
  </p>

  <h3 class="mt-6 mb-2 font-semibold">Route rules</h3>
  <Code code={rulesCode} language="js" />

  <h3 class="mt-6 mb-2 font-semibold">How rules are evaluated</h3>
  <ul class="text-surface-z7 mb-4 list-inside list-disc space-y-1 text-sm">
    <li>Rules are prefix-matched in order — first match wins</li>
    <li><code>public: true</code> — accessible without authentication</li>
    <li><code>protected: true</code> — requires any valid session</li>
    <li><code>roles: ['admin']</code> — requires one of the listed roles</li>
    <li>Unauthenticated access to protected route → redirect to auth route</li>
    <li>Wrong role → redirect to <code>roleHome[role]</code> or auth route</li>
  </ul>

  <!-- Session -->
  <h2 class="mt-10 mb-3 text-xl font-semibold">Session Management</h2>
  <p class="text-surface-z7 mb-4">
    Kavach uses stateless cookie-based sessions — no server-side session store required. The session
    is stored in an httpOnly cookie, parsed on each request by <code>kavach.handle</code>, and
    available as <code>event.locals.session</code> in all load functions.
  </p>

  <h3 class="mt-6 mb-2 font-semibold">The full session chain</h3>
  <Code code={sessionChainCode} language="js" />

  <h3 class="mt-6 mb-2 font-semibold">Session shape</h3>
  <Code code={sessionShape} language="js" />

  <h3 class="mt-6 mb-2 font-semibold">Token refresh</h3>
  <p class="text-surface-z7 mb-4">
    When the adapter fires an auth state change (e.g. after OAuth callback), the client POSTs to
    <code>/auth/session</code>. The server validates the token via the adapter, writes a fresh
    cookie, and calls <code>invalidateAll()</code> to re-run load functions.
  </p>

  <h2 class="mt-8 mb-3 text-xl font-semibold">Next Steps</h2>
  <ul class="space-y-2">
    <li>
      <a href="/docs/adapters/supabase" class="text-primary hover:underline"
        >Configure your adapter</a
      >
    </li>
    <li>
      <a href="/docs/configuration" class="text-primary hover:underline"
        >Full configuration reference</a
      >
    </li>
    <li><a href="/docs/cli" class="text-primary hover:underline">CLI reference</a></li>
  </ul>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | grep -iE "error" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add sites/learn/src/routes/\(public\)/docs/core-concepts/
git commit -m "feat(learn): add Core Concepts page merging auth, authz, session"
```

---

### Task 8: CLI page rewrite

**Files:**

- Modify: `sites/learn/src/routes/(public)/docs/cli/+page.svelte`

- [ ] **Step 1: Rewrite page**

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const initCmd = `# run from your SvelteKit project root
npx kavach init
# or with bun
bunx kavach init`

  const initGenerates = `kavach.config.js                        adapter, providers, rules, env var names
vite.config.js                          kavach() plugin injected before sveltekit()
src/hooks.server.js                     kavach.handle registered
src/routes/+layout.server.js            session: locals.session passed to pages
src/routes/(public)/auth/+page.svelte   auth page with configured providers
.env                                    env var keys added (values left empty)`

  const doctorCmds = `npx kavach doctor        # check only — no changes made
npx kavach doctor --fix  # check and auto-repair fixable issues`

  const doctorExample = `  ✓ kavach.config.js — valid
  ✗ vite.config.js — kavach() plugin missing
      Run kavach doctor --fix
  ✗ hooks.server.ts — must import from '$kavach/auth' and export kavach.handle
      Run kavach doctor --fix
  ✓ +layout.server.ts — valid
  ✗ .env — empty values: PUBLIC_SUPABASE_URL
      set PUBLIC_SUPABASE_URL=<your-value> in .env
  ✓ dependencies — all installed

  3 issues found. Run kavach doctor --fix to repair what can be fixed automatically.`

  const doctorFixExample = `  ✓ kavach.config.js — valid
  ✔ vite.config.js — patched
  ✔ hooks.server.ts — patched
  ✓ +layout.server.ts — valid
  ✗ .env — empty values: PUBLIC_SUPABASE_URL
      set PUBLIC_SUPABASE_URL=<your-value> in .env
  ✓ dependencies — all installed

  1 issue requires manual action — see above.`

  const addCmds = `npx kavach add auth-page   # auth page with configured providers
npx kavach add routes      # data and RPC route handlers`

  const antiPatterns = `// ✗ No default export — will throw at runtime
import kavach from 'kavach'

// ✗ Don't call createKavach in hooks.server — $kavach/auth already has a configured instance
import { createKavach } from 'kavach'
export const handle = createKavach(adapter).handle

// ✗ Do not alias the kavach package in vite.config
resolve: { alias: { kavach: '/path/to/src/index.ts' } }

// ✗ Not needed — $kavach/auth handles SSR bundling
ssr: { noExternal: ['kavach'] }

// ✓ Always use the virtual module in hooks.server
import { kavach } from '$kavach/auth'
export const handle = kavach.handle`

  const doctorChecks = [
    ['1', 'kavach.config.js exists with adapter, env, rules', 'No — run kavach init'],
    ['2', 'vite.config.js has kavach() from @kavach/vite before sveltekit()', 'Yes'],
    ['3', 'hooks.server imports $kavach/auth and exports kavach.handle', 'Yes'],
    ['4', '+layout.server passes session: locals.session', 'Yes'],
    ['5', 'All env keys from config exist in .env', 'Yes — adds empty keys'],
    ['6', '.env values are non-empty', 'No — prints set KEY=<value> instruction'],
    ['7', 'Adapter + kavach packages in package.json', 'Yes — installs missing']
  ]
</script>

<div class="max-w-4xl">
  <h1 class="mb-4 text-3xl font-bold">CLI</h1>
  <p class="text-surface-z7 mb-6 text-lg">
    Always use the CLI to set up and maintain kavach. Never hand-write <code>kavach.config.js</code
    >, vite patches, or hooks files.
  </p>

  <div class="border-primary bg-primary/5 mb-8 rounded-lg border-l-4 p-4 text-sm">
    <strong>For AI agents:</strong> Never hand-craft kavach integration files. Use
    <code>npx kavach init</code> for first-time setup and
    <code>npx kavach doctor --fix</code> to repair existing setups. Hand-written files are the most common
    source of broken integrations.
  </div>

  <h2 class="mt-8 mb-3 text-xl font-semibold">kavach init</h2>
  <p class="text-surface-z7 mb-3">
    Scaffolds a complete kavach setup. Run once per project from the SvelteKit project root.
  </p>
  <Code code={initCmd} language="bash" />

  <h3 class="mt-5 mb-2 font-semibold">Interactive prompts</h3>
  <ol class="text-surface-z7 mb-4 list-inside list-decimal space-y-1 text-sm">
    <li>Choose adapter — supabase | firebase | auth0 | amplify | convex</li>
    <li>Choose providers — email/password, magic link, Google, GitHub, etc.</li>
    <li>Configure data route (optional, adapter-dependent)</li>
    <li>Configure RPC route (optional, adapter-dependent)</li>
    <li>Configure logging (optional, adapter-dependent)</li>
    <li>Set auth route path (default: <code>(public)/auth</code>)</li>
    <li>Set logout route (default: <code>/logout</code>)</li>
    <li>Enable cached logins</li>
    <li>Define route protection rules</li>
  </ol>

  <h3 class="mt-5 mb-2 font-semibold">Files generated / patched</h3>
  <Code code={initGenerates} language="text" />

  <h2 class="mt-10 mb-3 text-xl font-semibold">kavach doctor</h2>
  <p class="text-surface-z7 mb-3">
    Validates an existing kavach integration and optionally auto-repairs fixable issues. Use this
    after <code>kavach init</code>, after manual changes, or when diagnosing a broken setup.
  </p>
  <Code code={doctorCmds} language="bash" />

  <h3 class="mt-5 mb-2 font-semibold">Checks performed</h3>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-surface-z3 border-b">
          <th class="py-2 pr-3">#</th>
          <th class="py-2 pr-4">Check</th>
          <th class="py-2">Auto-fixable</th>
        </tr>
      </thead>
      <tbody>
        {#each doctorChecks as [n, check, fix]}
          <tr class="border-surface-z3 border-b">
            <td class="text-surface-z5 py-2 pr-3">{n}</td>
            <td class="py-2 pr-4 text-sm">{check}</td>
            <td class="text-surface-z6 py-2 text-sm">{fix}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h3 class="mt-5 mb-2 font-semibold">Example output</h3>
  <Code code={doctorExample} language="text" />
  <p class="text-surface-z7 mt-3 mb-2 text-sm">After running with <code>--fix</code>:</p>
  <Code code={doctorFixExample} language="text" />

  <h2 class="mt-10 mb-3 text-xl font-semibold">kavach add</h2>
  <p class="text-surface-z7 mb-3">Add components to an existing setup.</p>
  <Code code={addCmds} language="bash" />
  <div class="mt-4 overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-surface-z3 border-b">
          <th class="py-2 pr-6">Command</th>
          <th class="py-2">Generates</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-surface-z3 border-b">
          <td class="py-2 pr-6"><code>kavach add auth-page</code></td>
          <td class="text-surface-z6 py-2"
            >Auth page with all configured providers using <code>&lt;AuthPage /&gt;</code></td
          >
        </tr>
        <tr>
          <td class="py-2 pr-6"><code>kavach add routes</code></td>
          <td class="text-surface-z6 py-2">Data and RPC route handlers under configured paths</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="mt-10 mb-3 text-xl font-semibold">Anti-patterns</h2>
  <p class="text-surface-z7 mb-3">
    These patterns look reasonable but cause broken integrations. The CLI avoids them automatically.
  </p>
  <Code code={antiPatterns} language="js" />

  <h2 class="mt-10 mb-3 text-xl font-semibold">Verifying your setup</h2>
  <p class="text-surface-z7 mb-3">
    After <code>kavach init</code> or any manual changes:
  </p>
  <Code code={`npx kavach doctor`} language="bash" />
  <p class="text-surface-z7 mt-3 text-sm">
    All 7 checks should show ✓. If any show ✗, run <code>kavach doctor --fix</code> and follow the printed
    instructions for any remaining manual items.
  </p>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | grep -iE "error" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add sites/learn/src/routes/\(public\)/docs/cli/+page.svelte
git commit -m "feat(learn): rewrite CLI docs with kavach doctor, anti-patterns, verify section"
```

---

### Task 9: Quick Start rewrite

**Files:**

- Modify: `sites/learn/src/routes/(public)/docs/quick-start/+page.svelte`

- [ ] **Step 1: Rewrite page**

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const initCmd = `npx kavach init`
  const verifyCmd = `npx kavach doctor`
  const devCmd = `npm run dev`

  const envExample = `# .env — fill in values from your backend project dashboard
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key`

  const manualInstall = `npm install kavach @kavach/vite @kavach/ui
npm install @kavach/adapter-supabase  # replace with your adapter`

  const manualVite = `// vite.config.js — kavach() must come before sveltekit()
import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [kavach(), sveltekit()]
})`

  const manualConfig = `// kavach.config.js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' }
  ],
  rules: [
    { path: '/auth', public: true },
    { path: '/', public: true },
    { path: '/dashboard', protected: true }
  ],
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  }
}`

  const manualHooks = `// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle`

  const manualLayout = `// src/routes/+layout.server.js
export function load({ locals }) {
  return { session: locals.session }
}`
</script>

<div class="max-w-4xl">
  <h1 class="mb-4 text-3xl font-bold">Quick Start</h1>
  <p class="text-surface-z7 mb-8 text-lg">Get kavach running in a SvelteKit project in minutes.</p>

  <section class="mb-8">
    <h2 class="mb-3 text-xl font-semibold">1. Run kavach init</h2>
    <p class="text-surface-z7 mb-3">
      From your SvelteKit project root. The wizard prompts for your adapter, providers, and route
      rules, then generates and patches all required files.
    </p>
    <Code code={initCmd} language="bash" />
    <p class="text-surface-z7 mt-3 text-sm">
      Do not create <code>kavach.config.js</code> or modify <code>vite.config.js</code> /
      <code>hooks.server.js</code> manually — the CLI handles all of this correctly.
    </p>
  </section>

  <section class="mb-8">
    <h2 class="mb-3 text-xl font-semibold">2. Fill in environment variables</h2>
    <p class="text-surface-z7 mb-3">
      <code>kavach init</code> adds the required variable names to <code>.env</code> with empty values.
      Fill them in from your backend dashboard.
    </p>
    <Code code={envExample} language="bash" />
  </section>

  <section class="mb-8">
    <h2 class="mb-3 text-xl font-semibold">3. Verify the setup</h2>
    <Code code={verifyCmd} language="bash" />
    <p class="text-surface-z7 mt-3 text-sm">
      All 7 checks should show ✓. If any show ✗, run <code>kavach doctor --fix</code> and follow the printed
      instructions.
    </p>
  </section>

  <section class="mb-10">
    <h2 class="mb-3 text-xl font-semibold">4. Start your dev server</h2>
    <Code code={devCmd} language="bash" />
    <p class="text-surface-z7 mt-3 text-sm">
      Navigate to your auth route (default <code>/auth</code>) to see the login page.
    </p>
  </section>

  <details class="border-surface-z3 rounded-lg border p-4">
    <summary class="cursor-pointer font-semibold">Advanced: manual setup (without CLI)</summary>
    <div class="mt-4 space-y-4 text-sm">
      <p class="text-surface-z7">
        Only use this if the CLI cannot run in your environment. Manual setup is error-prone — run
        <code>kavach doctor</code> to verify afterwards.
      </p>
      <div>
        <p class="mb-2 font-medium">1. Install packages</p>
        <Code code={manualInstall} language="bash" />
      </div>
      <div>
        <p class="mb-2 font-medium">2. Create kavach.config.js</p>
        <Code code={manualConfig} language="js" />
      </div>
      <div>
        <p class="mb-2 font-medium">3. Patch vite.config.js</p>
        <Code code={manualVite} language="js" />
      </div>
      <div>
        <p class="mb-2 font-medium">4. Add hooks.server.js</p>
        <Code code={manualHooks} language="js" />
      </div>
      <div>
        <p class="mb-2 font-medium">5. Add layout.server.js</p>
        <Code code={manualLayout} language="js" />
      </div>
    </div>
  </details>

  <section class="mt-8">
    <h2 class="mb-3 text-xl font-semibold">Next Steps</h2>
    <ul class="space-y-2">
      <li>
        <a href="/docs/cli" class="text-primary hover:underline"
          >CLI reference — init, doctor, add</a
        >
      </li>
      <li>
        <a href="/docs/core-concepts" class="text-primary hover:underline"
          >Core concepts — auth, authorization, session</a
        >
      </li>
      <li>
        <a href="/docs/adapters/supabase" class="text-primary hover:underline">Adapter setup</a>
      </li>
    </ul>
  </section>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | grep -iE "error" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add sites/learn/src/routes/\(public\)/docs/quick-start/+page.svelte
git commit -m "feat(learn): rewrite Quick Start as CLI-first with manual as collapsed advanced section"
```

---

### Task 10: LLM docs — llms.txt, auth.txt, cli.txt

**Files:**

- Modify: `sites/learn/static/llms/llms.txt`
- Modify: `sites/learn/static/llms/auth.txt`
- Modify: `sites/learn/static/llms/cli.txt`

- [ ] **Step 1: Rewrite llms.txt**

Replace the entire file with:

```
# Kavach

> A drop-in authentication framework for SvelteKit with unified API across multiple
> platforms, declarative route protection, and pre-built UI components.

## IMPORTANT — For AI Agents

Never hand-write kavach.config.js, vite.config.js patches, or hooks.server.js.
Always use the CLI:

    npx kavach init            # first-time setup in a SvelteKit project
    npx kavach doctor          # verify an existing setup
    npx kavach doctor --fix    # auto-repair detected issues

Hand-crafting these files is the most common source of broken integrations.
The CLI handles correct patching, plugin ordering (kavach() before sveltekit()),
and the $kavach/auth virtual module pattern automatically.

## How It Works

kavach.config.js → @kavach/vite plugin → $kavach/auth virtual module
→ kavach.handle hook → sentry route protection → session cookie → locals.session

## Core Packages

- [Auth](./auth.txt): Core — createKavach, session management, auth state
- [CLI](./cli.txt): kavach init, kavach doctor, kavach add
- [Sentry](./sentry.txt): Route protection engine — rules, roles, redirect logic
- [UI](./ui.txt): Pre-built Svelte components — AuthProvider, AuthPage
- [Vite Plugin](./vite.txt): Virtual module generation from kavach.config.js
- [Logger](./logger.txt): Structured audit logging with adapter support
- [Query](./query.txt): Declarative data query helpers
- [Cookie](./cookie.txt): Cookie serialization and parsing utilities
- [Hashing](./hashing.txt): Password and token hashing utilities

## Adapters

- [Supabase](./adapter-supabase.txt): Full capabilities — auth, data, RPC, logging
- [Firebase](./adapter-firebase.txt): Auth, OAuth, magic link, passkey
- [Auth0](./adapter-auth0.txt): Auth, OAuth, magic link, password
- [AWS Amplify](./adapter-amplify.txt): Auth, OAuth, password (Cognito)
- [Convex](./adapter-convex.txt): Auth, OAuth, password

## Troubleshooting

Run `npx kavach doctor` to diagnose integration issues. It checks config, vite plugin,
hooks pattern, layout session, env vars, and dependencies — and can auto-fix most issues.

See [CLI](./cli.txt) for full doctor output reference.
```

- [ ] **Step 2: Rewrite auth.txt**

Replace the entire file with:

```
# Kavach — Auth (kavach)

> Core authentication client for SvelteKit. Wraps platform adapters with a unified
> interface for sign-in, sign-out, and session management.

## IMPORTANT — Use the CLI

Never import from 'kavach' directly in hooks.server.js or hand-write kavach.config.js.

    npx kavach init          # scaffolds everything correctly
    npx kavach doctor --fix  # repairs existing broken setups

## Install

    npm install kavach @kavach/vite
    npm install @kavach/adapter-supabase  # choose your adapter — required

## Setup

Run `npx kavach init` — it handles all steps automatically.

If you must set up manually (run `kavach doctor` to verify afterwards):

### 1. kavach.config.js

    export default {
      adapter: 'supabase',
      providers: [
        { name: 'google', label: 'Continue with Google' },
        { name: 'magic', mode: 'otp', label: 'Magic Link' },
        { name: 'email', mode: 'password', label: 'Email' }
      ],
      rules: [
        { path: '/auth', public: true },
        { path: '/', public: true },
        { path: '/dashboard', protected: true },
        { path: '/admin', roles: ['admin'] }
      ],
      env: {
        url: 'PUBLIC_SUPABASE_URL',
        anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
      }
    }

### 2. vite.config.js — kavach() must come before sveltekit()

    import { kavach } from '@kavach/vite'
    import { sveltekit } from '@sveltejs/kit/vite'
    import { defineConfig } from 'vite'

    export default defineConfig({
      plugins: [kavach(), sveltekit()]
    })

### 3. hooks.server.js

    import { kavach } from '$kavach/auth'
    export const handle = kavach.handle

### 4. +layout.server.js

    export function load({ locals }) {
      return { session: locals.session }
    }

## Anti-Patterns

    // No default export — will fail
    import kavach from 'kavach'

    // Do not call createKavach in hooks.server — $kavach/auth already has a configured instance
    import { createKavach } from 'kavach'
    export const handle = createKavach(adapter).handle

    // Do not alias the kavach package
    resolve: { alias: { kavach: '/path/to/src/index.ts' } }

    // Not needed when using $kavach/auth virtual module
    ssr: { noExternal: ['kavach'] }

    // Correct
    import { kavach } from '$kavach/auth'
    export const handle = kavach.handle

## Client-Side Setup

In root layout onMount (browser only):

    // src/routes/+layout.svelte
    import { setContext, onMount } from 'svelte'
    import { page } from '$app/stores'

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

## API

### createKavach(adapter, options)

Creates a browser-side kavach instance.

    const instance = createKavach(adapter, {
      logger?,       // from $kavach/auth
      invalidateAll? // from $app/navigation
    })

Returns: { signIn, signOut, onAuthChange, handle, getCachedLogins, ... }

### kavach.signIn(credentials)

    await kavach.signIn({ provider: 'google' })
    await kavach.signIn({ provider: 'email', email, password })
    await kavach.signIn({ provider: 'magic', email })

### kavach.signOut()

    await kavach.signOut()

## Virtual Module: $kavach/auth

Generated by @kavach/vite from kavach.config.js. Exports:

- `kavach` — pre-configured server-side instance with .handle hook
- `adapter` — instantiated adapter
- `logger` — configured logger instance

## Session

Kavach sets `event.locals.session` on every request via kavach.handle.

    // src/routes/+layout.server.js
    export function load({ locals }) {
      return { session: locals.session }
    }

    // guard individual routes
    export function load({ locals }) {
      if (!locals.session) redirect(303, '/auth')
      return { user: locals.session.user }
    }

Session shape:

    {
      user: { id: string, email: string, role: string },
      access_token: string,
      refresh_token: string,
      expires_in: number
    }

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| ERR_RESOLVE_PACKAGE_ENTRY_FAIL | Direct kavach import or resolve.alias in hooks | Use $kavach/auth virtual module |
| kavach is undefined | Default import from kavach | No default export; use $kavach/auth |
| kavach.handle is not a function | Old manual setup | Run kavach doctor --fix |
| Hook not running | kavach() plugin missing from vite.config | Run kavach doctor --fix |

Run `npx kavach doctor` to diagnose any setup issue.

## Related

- [CLI](./cli.txt) — kavach init, doctor, add
- [Sentry](./sentry.txt) — standalone route protection engine
- [UI](./ui.txt) — pre-built sign-in components
- [Vite Plugin](./vite.txt) — virtual module generation
```

- [ ] **Step 3: Rewrite cli.txt**

Replace the entire file with:

```
# Kavach — CLI (@kavach/cli)

> Scaffolding CLI for adding and maintaining Kavach in SvelteKit projects.
> Always use the CLI — never hand-write config files or patches.

## IMPORTANT — For AI Agents

Never hand-craft kavach integration files. The CLI is the only supported path.

    npx kavach init            # first-time setup
    npx kavach doctor          # verify existing setup
    npx kavach doctor --fix    # auto-repair issues

## Install

    npm install -g @kavach/cli
    # or without installing:
    npx kavach <command>
    bunx kavach <command>

## Commands

### kavach init

Scaffolds a complete kavach setup from the SvelteKit project root.

    npx kavach init

Interactive prompts:
1. Choose adapter: supabase | firebase | auth0 | amplify | convex
2. Choose providers: email/password, magic link, Google, GitHub, etc.
3. Configure data route (optional, adapter-dependent)
4. Configure RPC route (optional, adapter-dependent)
5. Configure logging (optional, adapter-dependent)
6. Set auth route path (default: (public)/auth)
7. Set logout route (default: /logout)
8. Enable cached logins
9. Define route protection rules

Files generated / patched:
- kavach.config.js — adapter, providers, rules, env var names
- vite.config.js — kavach() plugin injected before sveltekit()
- src/hooks.server.js — kavach.handle registered
- src/routes/+layout.server.js — session: locals.session passed to pages
- src/routes/(public)/auth/+page.svelte — auth page with providers
- .env — env var keys added with empty values

### kavach doctor [--fix]

Validates an existing kavach integration. Use after init, after manual changes,
or when diagnosing a broken setup.

    npx kavach doctor        # check only
    npx kavach doctor --fix  # check and auto-repair

Checks:

| # | Check | Auto-fixable |
|---|-------|-------------|
| 1 | kavach.config.js exists with adapter, env, rules | No — run kavach init |
| 2 | vite.config.js has kavach() from @kavach/vite, before sveltekit() | Yes |
| 3 | hooks.server imports $kavach/auth and exports kavach.handle | Yes |
| 4 | +layout.server passes session: locals.session | Yes |
| 5 | All env keys from config exist in .env | Yes — adds empty keys |
| 6 | .env values are non-empty | No — prints set KEY=<value> instructions |
| 7 | Adapter + kavach packages in package.json | Yes — installs missing |

Example output:

    kavach doctor

      ✓ kavach.config.js — valid
      ✗ vite.config.js — kavach() plugin missing
          Run kavach doctor --fix
      ✗ hooks.server.ts — must import from '$kavach/auth' and export kavach.handle
          Run kavach doctor --fix
      ✓ +layout.server.ts — valid
      ✗ .env — empty values: PUBLIC_SUPABASE_URL
          set PUBLIC_SUPABASE_URL=<your-value> in .env
      ✓ dependencies — all installed

      3 issues found. Run kavach doctor --fix to repair what can be fixed automatically.

After --fix:

    kavach doctor --fix

      ✓ kavach.config.js — valid
      ✔ vite.config.js — patched
      ✔ hooks.server.ts — patched
      ✓ +layout.server.ts — valid
      ✗ .env — empty values: PUBLIC_SUPABASE_URL
          set PUBLIC_SUPABASE_URL=<your-value> in .env
      ✓ dependencies — all installed

      1 issue requires manual action — see above.

### kavach add

Adds components to an existing setup.

    npx kavach add auth-page   # auth page with configured providers
    npx kavach add routes      # data and RPC route handlers

## Anti-Patterns

    // No default export — will throw
    import kavach from 'kavach'

    // Don't call createKavach in hooks.server
    import { createKavach } from 'kavach'

    // Do not alias the package in vite.config
    resolve: { alias: { kavach: '/path/to/src/index.ts' } }

    // Not needed when using $kavach/auth
    ssr: { noExternal: ['kavach'] }

    // Correct
    import { kavach } from '$kavach/auth'
    export const handle = kavach.handle

## Verifying Your Setup

    npx kavach doctor

All 7 checks should show ✓. If any show ✗:
- Run npx kavach doctor --fix for auto-fixable issues
- For env value issues: set the values in .env manually

## Related

- [Auth](./auth.txt) — manual setup reference and API
- [Vite Plugin](./vite.txt) — kavach.config.js reference
```

- [ ] **Step 4: Verify full site build**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | tail -5
```

Expected: build completes, no errors

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/Jerry/Developer/kavach && bun vitest run
```

Expected: all tests pass (existing 626 + new checks/doctor tests)

- [ ] **Step 6: Commit**

```bash
git add sites/learn/static/llms/llms.txt sites/learn/static/llms/auth.txt sites/learn/static/llms/cli.txt
git commit -m "docs(llms): add agent directives, anti-patterns, troubleshooting, kavach doctor"
```
