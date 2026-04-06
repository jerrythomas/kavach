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
	checkDeps,
	checkContextSetup,
	checkAuthPage,
	checkDataRoute
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
		expect(r.fixable).toBe(true)
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

	it('fails when routing uses app key instead of routes key', () => {
		writeFileSync(join(tmp, 'kavach.config.js'), 'export default {}')
		const r = checkConfig(tmp, {
			adapter: 'supabase',
			env: {},
			rules: [],
			app: { home: '/home', login: '/auth' }
		})
		expect(r.ok).toBe(false)
		expect(r.fixable).toBe(true)
		expect(r.message).toMatch(/app key/)
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

	it('passes when .env does not exist (missing keys are checkEnvKeys responsibility)', () => {
		// No .env file written
		const r = checkEnvValues(tmp, config)
		expect(r.ok).toBe(true)
	})
})

// --- checkContextSetup ---

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

// --- checkAuthPage ---

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

// --- checkDataRoute ---

describe('checkDataRoute', () => {
	const config = { routes: { data: '/data' } }

	it('passes when no data route configured', () => {
		const r = checkDataRoute(tmp, {})
		expect(r.ok).toBe(true)
	})

	it('fails when data route file is missing', () => {
		const r = checkDataRoute(tmp, config)
		expect(r.ok).toBe(false)
		expect(r.fixable).toBe(true)
		expect(r.message).toMatch(/not found/)
	})

	it('fails when data route does not export from kavach', () => {
		mkdirSync(join(tmp, 'src/routes/data'), { recursive: true })
		writeFileSync(join(tmp, 'src/routes/data/+server.js'), `export const GET = () => {}`)
		const r = checkDataRoute(tmp, config)
		expect(r.ok).toBe(false)
		expect(r.fixable).toBe(true)
		expect(r.message).toMatch(/kavach/)
	})

	it('passes when data route exports from kavach', () => {
		mkdirSync(join(tmp, 'src/routes/data'), { recursive: true })
		writeFileSync(
			join(tmp, 'src/routes/data/+server.js'),
			`export { GET, POST, PUT, PATCH, DELETE } from 'kavach'`
		)
		const r = checkDataRoute(tmp, config)
		expect(r.ok).toBe(true)
	})

	it('passes when data route is inside a route group', () => {
		mkdirSync(join(tmp, 'src/routes/(server)/data'), { recursive: true })
		writeFileSync(
			join(tmp, 'src/routes/(server)/data/+server.js'),
			`export { GET, POST, PUT, PATCH, DELETE } from 'kavach'`
		)
		const r = checkDataRoute(tmp, config)
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
