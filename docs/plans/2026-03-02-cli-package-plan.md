# CLI Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `@kavach/cli` — a CLI + Vite plugin that scaffolds kavach into SvelteKit projects via `kavach.config.js` and `$kavach/*` virtual modules.

**Architecture:** Root `kavach.config.js` is the single source of truth. A Vite plugin reads it at dev/build time and provides virtual modules (`$kavach/auth`, `$kavach/config`, `$kavach/routes`, `$kavach/providers`). The CLI interactively creates the config file, patches existing SvelteKit files, and generates auth/data routes.

**Tech Stack:** Node.js, `@clack/prompts` (interactive prompts), `magicast` (AST-based JS patching), Vite plugin API, vitest for testing.

---

### Task 1: Package scaffold

**Files:**
- Create: `solution/packages/cli/package.json`
- Create: `solution/packages/cli/src/index.js`
- Create: `solution/packages/cli/src/vite.js`
- Modify: `solution/vitest.config.js` (add cli project)

**Step 1: Create package.json**

```json
{
  "name": "@kavach/cli",
  "version": "1.0.0-next.1",
  "description": "CLI and Vite plugin for scaffolding kavach into SvelteKit projects",
  "type": "module",
  "bin": {
    "kavach": "src/index.js"
  },
  "exports": {
    ".": "./src/index.js",
    "./vite": "./src/vite.js"
  },
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@clack/prompts": "^0.9.1",
    "magicast": "^0.3.5",
    "picocolors": "^1.1.1"
  },
  "peerDependencies": {
    "vite": ">=5.0.0"
  },
  "author": "Jerry Thomas <me@jerrythomas.name>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

**Step 2: Create placeholder entry files**

`src/index.js`:
```js
#!/usr/bin/env node
console.log('kavach cli')
```

`src/vite.js`:
```js
export function kavach() {
  return { name: 'kavach' }
}
```

**Step 3: Add to vitest.config.js**

Add to the projects array:
```js
{ extends: true, test: { name: 'cli', root: 'packages/cli' } }
```

**Step 4: Install dependencies**

Run: `cd solution && pnpm install`

**Step 5: Run tests to verify nothing broke**

Run: `cd solution && pnpm run test:ci`
Expected: All 440+ existing tests pass, no cli tests yet.

**Step 6: Commit**

```
feat(cli): scaffold @kavach/cli package
```

---

### Task 2: Config loader

**Files:**
- Create: `solution/packages/cli/src/config.js`
- Create: `solution/packages/cli/spec/config.spec.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { parseConfig, validateConfig } from '../src/config.js'

describe('parseConfig', () => {
  const validConfig = {
    adapter: 'supabase',
    providers: [
      { name: 'google', label: 'Continue with Google' },
      { mode: 'password', name: 'email', label: 'Sign in using' }
    ],
    cachedLogins: true,
    logging: { level: 'info', table: 'audit.logs' },
    env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
    routes: {
      auth: '(public)/auth',
      data: '(server)/data',
      logout: '/logout'
    },
    rules: [{ path: '/public', public: true }]
  }

  it('should accept a valid config', () => {
    const result = parseConfig(validConfig)
    expect(result.adapter).toBe('supabase')
    expect(result.providers).toHaveLength(2)
    expect(result.cachedLogins).toBe(true)
    expect(result.logging.level).toBe('info')
    expect(result.logging.table).toBe('audit.logs')
    expect(result.env.url).toBe('PUBLIC_SUPABASE_URL')
  })

  it('should apply defaults for missing optional fields', () => {
    const result = parseConfig({ adapter: 'supabase' })
    expect(result.providers).toEqual([])
    expect(result.cachedLogins).toBe(false)
    expect(result.logging.level).toBe('error')
    expect(result.logging.table).toBe('logs')
    expect(result.env.url).toBe('PUBLIC_SUPABASE_URL')
    expect(result.env.anonKey).toBe('PUBLIC_SUPABASE_ANON_KEY')
    expect(result.routes.auth).toBe('(public)/auth')
    expect(result.routes.data).toBe('(server)/data')
    expect(result.routes.logout).toBe('/logout')
    expect(result.rules).toEqual([])
  })
})

describe('validateConfig', () => {
  it('should reject config without adapter', () => {
    expect(() => validateConfig({})).toThrow('adapter is required')
  })

  it('should reject unknown adapter', () => {
    expect(() => validateConfig({ adapter: 'unknown' })).toThrow('Unknown adapter')
  })

  it('should reject invalid provider shape', () => {
    expect(() => validateConfig({
      adapter: 'supabase',
      providers: [{ label: 'no name' }]
    })).toThrow('name is required')
  })

  it('should accept valid config', () => {
    expect(() => validateConfig({ adapter: 'supabase' })).not.toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: FAIL — `parseConfig` not found.

**Step 3: Write implementation**

`src/config.js`:
```js
const KNOWN_ADAPTERS = ['supabase']

const ADAPTER_ENV_DEFAULTS = {
  supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}

const DEFAULTS = {
  providers: [],
  cachedLogins: false,
  logging: { level: 'error', table: 'logs' },
  routes: {
    auth: '(public)/auth',
    data: '(server)/data',
    logout: '/logout'
  },
  rules: []
}

export function validateConfig(config) {
  if (!config.adapter) throw new Error('adapter is required')
  if (!KNOWN_ADAPTERS.includes(config.adapter)) {
    throw new Error(`Unknown adapter: "${config.adapter}". Available: ${KNOWN_ADAPTERS.join(', ')}`)
  }
  if (config.providers) {
    for (const p of config.providers) {
      if (!p.name) throw new Error('Each provider must have a name — name is required')
    }
  }
}

export function parseConfig(raw) {
  validateConfig(raw)
  const envDefaults = ADAPTER_ENV_DEFAULTS[raw.adapter] ?? {}
  return {
    adapter: raw.adapter,
    providers: raw.providers ?? DEFAULTS.providers,
    cachedLogins: raw.cachedLogins ?? DEFAULTS.cachedLogins,
    logging: {
      level: raw.logging?.level ?? DEFAULTS.logging.level,
      table: raw.logging?.table ?? DEFAULTS.logging.table
    },
    env: { ...envDefaults, ...raw.env },
    routes: {
      auth: raw.routes?.auth ?? DEFAULTS.routes.auth,
      data: raw.routes?.data ?? DEFAULTS.routes.data,
      logout: raw.routes?.logout ?? DEFAULTS.routes.logout
    },
    rules: raw.rules ?? DEFAULTS.rules
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: PASS

**Step 5: Commit**

```
feat(cli): add config loader with validation and defaults
```

---

### Task 3: Vite plugin — virtual module resolution

**Files:**
- Modify: `solution/packages/cli/src/vite.js`
- Create: `solution/packages/cli/spec/vite.spec.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest'
import { kavach } from '../src/vite.js'

describe('kavach vite plugin', () => {
  it('should return a plugin with correct name', () => {
    const plugin = kavach()
    expect(plugin.name).toBe('kavach')
  })

  it('should resolve $kavach/* virtual module ids', () => {
    const plugin = kavach()
    expect(plugin.resolveId('$kavach/auth')).toBe('\0$kavach/auth')
    expect(plugin.resolveId('$kavach/config')).toBe('\0$kavach/config')
    expect(plugin.resolveId('$kavach/routes')).toBe('\0$kavach/routes')
    expect(plugin.resolveId('$kavach/providers')).toBe('\0$kavach/providers')
  })

  it('should not resolve non-kavach modules', () => {
    const plugin = kavach()
    expect(plugin.resolveId('svelte')).toBeUndefined()
    expect(plugin.resolveId('$app/navigation')).toBeUndefined()
  })

  it('should load virtual modules with valid JS', () => {
    const plugin = kavach({ configPath: 'nonexistent' })
    // When config file is missing, load should return fallback or throw
    // We'll test with actual config in integration tests
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: FAIL — `resolveId` not a function.

**Step 3: Write implementation**

`src/vite.js`:
```js
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseConfig } from './config.js'

const VIRTUAL_MODULES = ['$kavach/auth', '$kavach/config', '$kavach/routes', '$kavach/providers']

export function kavach(options = {}) {
  let config

  return {
    name: 'kavach',

    configResolved(viteConfig) {
      const configPath = options.configPath ?? resolve(viteConfig.root ?? process.cwd(), 'kavach.config.js')
      try {
        // Config loading happens at buildStart via dynamic import
        this._configPath = configPath
      } catch {
        // Handled in buildStart
      }
    },

    resolveId(id) {
      if (VIRTUAL_MODULES.includes(id)) return '\0' + id
    },

    async buildStart() {
      const configPath = this._configPath ?? options.configPath
      if (configPath) {
        try {
          const mod = await import(configPath)
          config = parseConfig(mod.default)
        } catch {
          // Config not found — will error on load
        }
      }
    },

    load(id) {
      if (!id.startsWith('\0$kavach/')) return
      if (!config) throw new Error('kavach.config.js not found or invalid. Run `npx @kavach/cli init` to create one.')

      const name = id.slice('\0$kavach/'.length)
      return generateModule(name, config)
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: PASS

**Step 5: Commit**

```
feat(cli): add Vite plugin with virtual module resolution
```

---

### Task 4: Virtual module code generation

**Files:**
- Create: `solution/packages/cli/src/generate.js`
- Create: `solution/packages/cli/spec/generate.spec.js`
- Modify: `solution/packages/cli/src/vite.js` (import generateModule)

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { generateModule } from '../src/generate.js'

const config = {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
    { mode: 'password', name: 'email', label: 'Sign in using' }
  ],
  cachedLogins: true,
  logging: { level: 'info', table: 'audit.logs' },
  env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
  routes: { auth: '(public)/auth', data: '(server)/data', logout: '/logout' },
  rules: [{ path: '/public', public: true }, { path: '/data', roles: '*' }]
}

describe('generateModule', () => {
  it('should generate $kavach/config module', () => {
    const code = generateModule('config', config)
    expect(code).toContain('export const config')
    expect(code).toContain("adapter: 'supabase'")
    expect(code).toContain('cachedLogins: true')
  })

  it('should generate $kavach/routes module', () => {
    const code = generateModule('routes', config)
    expect(code).toContain('export const routes')
    expect(code).toContain("path: '/public'")
    expect(code).toContain('public: true')
    expect(code).toContain("logout: '/logout'")
  })

  it('should generate $kavach/providers module', () => {
    const code = generateModule('providers', config)
    expect(code).toContain('export const providers')
    expect(code).toContain("name: 'google'")
    expect(code).toContain("mode: 'otp'")
  })

  it('should generate $kavach/auth module for supabase', () => {
    const code = generateModule('auth', config)
    expect(code).toContain("from '@kavach/adapter-supabase'")
    expect(code).toContain("from '@supabase/supabase-js'")
    expect(code).toContain('createKavach')
    expect(code).toContain('export')
    // Uses env var names from config.env
    expect(code).toContain('env.PUBLIC_SUPABASE_URL')
    expect(code).toContain('env.PUBLIC_SUPABASE_ANON_KEY')
    // Uses logging config values
    expect(code).toContain("level: 'info'")
    expect(code).toContain("table: 'audit.logs'")
  })

  it('should throw for unknown module', () => {
    expect(() => generateModule('unknown', config)).toThrow('Unknown virtual module')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: FAIL — `generateModule` not found.

**Step 3: Write implementation**

`src/generate.js` — generates JavaScript code strings for each virtual module. The auth module is adapter-specific; config/routes/providers are generic serialization.

This is the core of the Vite plugin. Each `generateModule(name, config)` returns a valid ES module string.

For supabase auth module (generated from config with `env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }` and `logging: { level: 'info', table: 'audit.logs' }`):
```js
import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const client = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY)
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const writer = getLogWriter({ url: env.PUBLIC_SUPABASE_URL, anonKey: env.PUBLIC_SUPABASE_ANON_KEY }, { table: 'audit.logs' })
const logger = getLogger(writer, { level: 'info' })

export const kavach = createKavach(adapter, {
  data,
  logger,
  rules: [/* from config.rules */]
})
export { adapter, logger }
```

The env var names come from `config.env`, the logging level and table come from `config.logging`. This means the generated code is fully determined by `kavach.config.js`.

**Step 4: Run test to verify it passes**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: PASS

**Step 5: Wire generateModule into vite.js**

Import `generateModule` from `./generate.js` and call it in the `load` method.

**Step 6: Commit**

```
feat(cli): add virtual module code generation for all $kavach/* modules
```

---

### Task 5: CLI init — prompts and config generation

**Files:**
- Create: `solution/packages/cli/src/commands/init.js`
- Create: `solution/packages/cli/src/prompts.js`
- Create: `solution/packages/cli/spec/prompts.spec.js`
- Modify: `solution/packages/cli/src/index.js` (wire init command)

**Step 1: Write the failing test for prompt result → config**

```js
import { describe, it, expect } from 'vitest'
import { buildConfig } from '../src/prompts.js'

describe('buildConfig', () => {
  it('should build config from prompt answers', () => {
    const answers = {
      adapter: 'supabase',
      providers: ['google', 'github', 'magic', 'password'],
      cachedLogins: true,
      logLevel: 'info',
      logTable: 'audit.logs',
      authRoute: '(public)/auth',
      dataRoute: '(server)/data',
      logoutRoute: '/logout'
    }
    const config = buildConfig(answers)
    expect(config.adapter).toBe('supabase')
    expect(config.providers).toHaveLength(4)
    expect(config.providers[0]).toEqual({ name: 'google', label: 'Continue with Google' })
    expect(config.providers[2]).toEqual({ mode: 'otp', name: 'magic', label: 'Email for Magic Link' })
    expect(config.providers[3]).toEqual({ mode: 'password', name: 'email', label: 'Sign in using' })
    expect(config.logging.level).toBe('info')
    expect(config.logging.table).toBe('audit.logs')
    expect(config.env.url).toBe('PUBLIC_SUPABASE_URL')
    expect(config.env.anonKey).toBe('PUBLIC_SUPABASE_ANON_KEY')
    expect(config.routes.auth).toBe('(public)/auth')
  })

  it('should generate default labels for providers', () => {
    const config = buildConfig({ adapter: 'supabase', providers: ['azure'] })
    expect(config.providers[0]).toEqual({
      name: 'azure',
      label: 'Continue with Azure',
      scopes: ['email', 'profile']
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && pnpm run test:ci -- --project cli`
Expected: FAIL

**Step 3: Write implementation**

`src/prompts.js` — maps prompt answers to kavach.config.js shape. Defines default labels and modes for known providers.

`src/commands/init.js` — runs the @clack/prompts flow, calls buildConfig, writes kavach.config.js, then triggers file generation/patching.

**Step 4: Run test to verify it passes**

**Step 5: Wire init into src/index.js**

```js
#!/usr/bin/env node
import { init } from './commands/init.js'

const command = process.argv[2]
if (command === 'init') await init()
else console.log('Usage: kavach init')
```

**Step 6: Commit**

```
feat(cli): add init command with interactive prompts
```

---

### Task 6: File generators — new files

**Files:**
- Create: `solution/packages/cli/src/generators.js`
- Create: `solution/packages/cli/spec/generators.spec.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { generateConfigFile, generateAuthPage, generateDataRoute } from '../src/generators.js'

const config = {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { mode: 'otp', name: 'magic', label: 'Email for Magic Link' }
  ],
  cachedLogins: true,
  logging: { level: 'info', table: 'audit.logs' },
  env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
  routes: { auth: '(public)/auth', data: '(server)/data', logout: '/logout' },
  rules: [{ path: '/public', public: true }]
}

describe('generateConfigFile', () => {
  it('should generate valid kavach.config.js content', () => {
    const content = generateConfigFile(config)
    expect(content).toContain('export default')
    expect(content).toContain("adapter: 'supabase'")
    expect(content).toContain("name: 'google'")
    expect(content).toContain('cachedLogins: true')
    expect(content).toContain("level: 'info'")
    expect(content).toContain("table: 'audit.logs'")
    expect(content).toContain("url: 'PUBLIC_SUPABASE_URL'")
  })
})

describe('generateAuthPage', () => {
  it('should generate auth page with AuthPage when cached logins enabled', () => {
    const content = generateAuthPage(config)
    expect(content).toContain('AuthPage')
    expect(content).toContain("from '@kavach/ui'")
    expect(content).toContain("from '$kavach/providers'")
  })

  it('should generate auth page with AuthProvider when cached logins disabled', () => {
    const content = generateAuthPage({ ...config, cachedLogins: false })
    expect(content).toContain('AuthProvider')
    expect(content).not.toContain('AuthPage')
  })
})

describe('generateDataRoute', () => {
  it('should generate data CRUD server endpoint', () => {
    const content = generateDataRoute()
    expect(content).toContain('export async function GET')
    expect(content).toContain('export async function POST')
    expect(content).toContain('export async function PUT')
    expect(content).toContain('export async function DELETE')
    expect(content).toContain('locals.kavach')
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

Each generator returns a string of the file content. Auth page uses the providers from `$kavach/providers`. Data route is based on the existing `sites/demo/src/routes/(server)/data/[...slug]/+server.js`.

**Step 4: Run test to verify it passes**

**Step 5: Commit**

```
feat(cli): add file generators for config, auth page, and data route
```

---

### Task 7: File patchers — surgical edits

**Files:**
- Create: `solution/packages/cli/src/patchers.js`
- Create: `solution/packages/cli/spec/patchers.spec.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { patchViteConfig, patchHooksServer, patchLayoutServer, patchEnvFile } from '../src/patchers.js'

describe('patchViteConfig', () => {
  it('should add kavach plugin to existing vite config', () => {
    const input = `import { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [sveltekit()] }`
    const output = patchViteConfig(input)
    expect(output).toContain("import { kavach } from '@kavach/cli/vite'")
    expect(output).toContain('kavach()')
    expect(output).toContain('sveltekit()')
  })

  it('should not duplicate if kavach already present', () => {
    const input = `import { kavach } from '@kavach/cli/vite'\nexport default { plugins: [kavach(), sveltekit()] }`
    const output = patchViteConfig(input)
    const count = (output.match(/kavach\(\)/g) || []).length
    expect(count).toBe(1)
  })
})

describe('patchHooksServer', () => {
  it('should create hooks.server.js when empty', () => {
    const output = patchHooksServer('')
    expect(output).toContain("import { kavach } from '$kavach/auth'")
    expect(output).toContain('kavach.handle')
  })

  it('should inject into existing hooks with sequence', () => {
    const input = `import { myHook } from '$lib/hooks'\nexport const handle = myHook`
    const output = patchHooksServer(input)
    expect(output).toContain("import { sequence } from '@sveltejs/kit/hooks'")
    expect(output).toContain('kavach.handle')
    expect(output).toContain('sequence(')
  })

  it('should add to existing sequence', () => {
    const input = `import { sequence } from '@sveltejs/kit/hooks'\nexport const handle = sequence(myHook)`
    const output = patchHooksServer(input)
    expect(output).toContain('kavach.handle')
    expect(output).toContain('sequence(kavach.handle, myHook)')
  })
})

describe('patchLayoutServer', () => {
  it('should create layout server when empty', () => {
    const output = patchLayoutServer('')
    expect(output).toContain('export function load')
    expect(output).toContain('locals.session')
  })

  it('should add session to existing load', () => {
    const input = `export function load({ locals }) { return { title: 'App' } }`
    const output = patchLayoutServer(input)
    expect(output).toContain('session:')
    expect(output).toContain("title: 'App'")
  })
})

describe('patchEnvFile', () => {
  const envConfig = { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }

  it('should append missing env vars from config.env', () => {
    const input = 'EXISTING_VAR=value'
    const output = patchEnvFile(input, envConfig)
    expect(output).toContain('EXISTING_VAR=value')
    expect(output).toContain('PUBLIC_SUPABASE_URL=')
    expect(output).toContain('PUBLIC_SUPABASE_ANON_KEY=')
  })

  it('should not duplicate existing vars', () => {
    const input = 'PUBLIC_SUPABASE_URL=http://localhost'
    const output = patchEnvFile(input, envConfig)
    const count = (output.match(/PUBLIC_SUPABASE_URL/g) || []).length
    expect(count).toBe(1)
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

`src/patchers.js` — uses `magicast` for AST transforms on JS files. Falls back to string manipulation for simpler cases (.env, layout.svelte). Each patcher takes current file content (string) and returns patched content (string). The caller handles reading/writing files.

**Step 4: Run test to verify it passes**

**Step 5: Commit**

```
feat(cli): add surgical file patchers for vite, hooks, layout, and env
```

---

### Task 8: Wire init command end-to-end

**Files:**
- Modify: `solution/packages/cli/src/commands/init.js`
- Create: `solution/packages/cli/src/fs.js` (file read/write helpers)

**Step 1: Wire the complete init flow**

`src/commands/init.js` ties everything together:
1. Detect SvelteKit project (check for `svelte.config.js`)
2. Run prompts (from `prompts.js`)
3. Build config (from `prompts.js`)
4. Generate kavach.config.js (from `generators.js`)
5. Patch vite.config.js, hooks.server.js, +layout.server.js, +layout.svelte (from `patchers.js`)
6. Generate auth page and data route (from `generators.js`)
7. Append to .env (from `patchers.js`)
8. Detect package manager and install deps
9. Print next steps

`src/fs.js` — helpers: `readFile(path)`, `writeFile(path, content)`, `fileExists(path)`, `detectPackageManager()`.

**Step 2: Manual test**

Create a temporary SvelteKit project, run `node packages/cli/src/index.js init` from the solution directory, verify all files are created/patched correctly.

**Step 3: Commit**

```
feat(cli): wire init command end-to-end
```

---

### Task 9: Add subcommands

**Files:**
- Create: `solution/packages/cli/src/commands/add.js`
- Modify: `solution/packages/cli/src/index.js` (wire add command)

**Step 1: Implement add auth-page**

Reads `kavach.config.js` from project root, calls `generateAuthPage(config)`, writes to the configured auth route path. Asks confirmation if file exists.

**Step 2: Implement add routes**

Reads `kavach.config.js`, calls `generateDataRoute()`, writes to the configured data route path. Asks confirmation if file exists.

**Step 3: Wire into index.js**

```js
#!/usr/bin/env node
import { init } from './commands/init.js'
import { add } from './commands/add.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'init') await init()
else if (command === 'add') await add(args[0])
else console.log('Usage: kavach <init|add auth-page|add routes>')
```

**Step 4: Commit**

```
feat(cli): add subcommands for auth-page and routes
```

---

### Task 10: Verify on new project

**Step 1: Create a fresh SvelteKit project**

```bash
cd /tmp
npx sv create kavach-test-app --template minimal
cd kavach-test-app
```

**Step 2: Run kavach init**

```bash
node /path/to/solution/packages/cli/src/index.js init
```

Walk through prompts, select supabase + google + magic link + password, enable cached logins.

**Step 3: Verify generated files**

Check that these exist and have correct content:
- `kavach.config.js`
- `src/hooks.server.js` (patched)
- `src/routes/(public)/auth/+page.svelte`
- `src/routes/(server)/data/[...slug]/+server.js`
- `.env` has supabase vars

**Step 4: Verify it builds**

```bash
pnpm install
pnpm build
```

Expected: Build succeeds with no errors.

**Step 5: Verify dev server starts**

```bash
pnpm dev
```

Expected: Dev server starts, auth page renders at `/auth`.

**Step 6: Commit any fixes discovered**

---

### Task 11: Migrate demo site

**Step 1: Create kavach.config.js for demo**

Based on the existing demo site config, create `solution/sites/demo/kavach.config.js`:

```js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'azure', label: 'Continue With Azure', scopes: ['email', 'profile'] }
  ],
  cachedLogins: false,
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

**Step 2: Add Vite plugin to demo**

Patch `solution/sites/demo/vite.config.js` to add `kavach()`.

**Step 3: Update hooks.server.js**

Replace the manual adapter wiring with `$kavach/auth` imports. Keep the demo-specific features (dev mode adapter switching, security headers) as additions on top.

**Step 4: Update layout files**

Simplify `+layout.svelte` to use `$kavach/auth` instead of manual adapter loading.

**Step 5: Run existing tests**

```bash
cd solution && pnpm run test:ci
```

Expected: All 440+ tests pass. Demo unit tests pass.

**Step 6: Run demo e2e tests if available**

```bash
cd solution/sites/demo && pnpm test
```

**Step 7: Commit**

```
feat(demo): migrate to kavach.config.js + Vite plugin
```

---

## Summary

| Task | What | Tests |
|------|------|-------|
| 1 | Package scaffold | — |
| 2 | Config loader | config.spec.js |
| 3 | Vite plugin resolution | vite.spec.js |
| 4 | Virtual module generation | generate.spec.js |
| 5 | CLI prompts → config | prompts.spec.js |
| 6 | File generators | generators.spec.js |
| 7 | File patchers | patchers.spec.js |
| 8 | Wire init end-to-end | Manual test |
| 9 | Add subcommands | Manual test |
| 10 | Verify on new project | Manual test |
| 11 | Migrate demo site | Existing test suite |
