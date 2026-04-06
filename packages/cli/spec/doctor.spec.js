import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { DoctorCommand } from '../src/commands/doctor.js'

let tmp

const validConfig = {
	adapter: 'supabase',
	env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
	routes: { auth: '/auth', data: '/data' },
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
	if (opts.dataRoute !== false) {
		mkdirSync(join(dir, 'src/routes/data'), { recursive: true })
		writeFileSync(
			join(dir, 'src/routes/data/+server.js'),
			opts.dataRoute ?? `export { GET, POST, PUT, PATCH, DELETE } from 'kavach'`
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

	it('reports missing kavach.config.js as fixable', async () => {
		scaffold(tmp, { config: false })
		const cmd = new DoctorCommand(tmp, false)
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'config')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('--fix generates kavach.config.js with defaults', async () => {
		scaffold(tmp, { config: false })
		const cmd = new DoctorCommand(tmp, true)
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'config')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
		const { existsSync, readFileSync } = await import('fs')
		expect(existsSync(join(tmp, 'kavach.config.js'))).toBe(true)
		const content = readFileSync(join(tmp, 'kavach.config.js'), 'utf8')
		expect(content).toContain('adapter')
		expect(content).toContain('supabase')
	})

	it('--fix generates config and continues with remaining checks', async () => {
		scaffold(tmp, { config: false })
		const cmd = new DoctorCommand(tmp, true)
		const results = await cmd.runChecksForTest()
		// config fixed — remaining checks should also have run
		expect(results.length).toBeGreaterThan(1)
		expect(results.find((r) => r.id === 'vite')).toBeDefined()
	})

	it('reports config using app routing key as fixable', async () => {
		scaffold(tmp, { config: false })
		writeFileSync(
			join(tmp, 'kavach.config.js'),
			`export default ${JSON.stringify({ adapter: 'supabase', env: {}, rules: [], app: { home: '/home', login: '/auth' } })}`
		)
		const cmd = new DoctorCommand(tmp, false)
		cmd._configForTest = {
			adapter: 'supabase',
			env: {},
			rules: [],
			app: { home: '/home', login: '/auth' }
		}
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'config')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('--fix migrates app routing key to routes key', async () => {
		scaffold(tmp, { config: false })
		const appConfig = {
			adapter: 'supabase',
			env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
			rules: [],
			app: {
				home: '/home',
				login: '/auth',
				logout: '/logout',
				session: '/auth/session',
				data: '/data'
			}
		}
		writeFileSync(join(tmp, 'kavach.config.js'), `export default ${JSON.stringify(appConfig)}`)
		const cmd = new DoctorCommand(tmp, true)
		cmd._configForTest = appConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'config')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
		const { readFileSync } = await import('fs')
		const content = readFileSync(join(tmp, 'kavach.config.js'), 'utf8')
		expect(content).toContain('routes')
		expect(content).toContain('/home')
		expect(content).not.toContain('app:')
	})

	it('reports missing data route as fixable', async () => {
		scaffold(tmp, { dataRoute: false })
		const cmd = new DoctorCommand(tmp, false)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'data-route')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('reports non-kavach data route as fixable', async () => {
		scaffold(tmp, { dataRoute: `export const GET = () => {}` })
		const cmd = new DoctorCommand(tmp, false)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'data-route')
		expect(check.ok).toBe(false)
		expect(check.fixable).toBe(true)
	})

	it('--fix generates standard data route when missing', async () => {
		scaffold(tmp, { dataRoute: false })
		const cmd = new DoctorCommand(tmp, true)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'data-route')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
		const { readFileSync } = await import('fs')
		const content = readFileSync(join(tmp, 'src/routes/data/+server.js'), 'utf8')
		expect(content).toContain("from 'kavach'")
	})

	it('--fix renames existing non-kavach data route and writes standard file', async () => {
		scaffold(tmp, { dataRoute: `export const GET = () => {}` })
		const cmd = new DoctorCommand(tmp, true)
		cmd._configForTest = validConfig
		const results = await cmd.runChecksForTest()
		const check = results.find((r) => r.id === 'data-route')
		expect(check.ok).toBe(true)
		expect(check.fixed).toBe(true)
		expect(check.message).toMatch(/deprecated/)
		const { readFileSync, existsSync } = await import('fs')
		const standard = readFileSync(join(tmp, 'src/routes/data/+server.js'), 'utf8')
		expect(standard).toContain("from 'kavach'")
		expect(existsSync(join(tmp, 'src/routes/data/deprecated_+server.js'))).toBe(true)
	})
})
