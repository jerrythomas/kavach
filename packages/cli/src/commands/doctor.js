import { resolve, dirname, basename } from 'path'
import { spawnSync } from 'child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
	checkConfig,
	checkVite,
	checkHooks,
	checkLayout,
	checkContextSetup,
	checkAuthPage,
	checkEnvKeys,
	checkEnvValues,
	checkDataRoute,
	checkDeps
} from '../checks.js'
import {
	patchViteConfig,
	patchHooksServer,
	patchLayoutServer,
	patchEnvFile,
	patchLayoutSvelte
} from '../patchers.js'
import { generateAuthPage, generateConfigFile } from '../generators.js'
import { parseConfig } from '@kavach/vite'
import { readFile, writeFile, fileExists, renameFile, detectPackageManager } from '../fs.js'
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
	runChecksForTest() {
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

	#runChecks() {
		const results = []

		const configResult = this.#applyFix(checkConfig(this.#cwd, this.#config), (r) =>
			this.#fixConfig(r)
		)
		results.push(configResult)
		if (!configResult.ok) return results // remaining checks need a valid config

		results.push(this.#applyFix(checkVite(this.#cwd), (r) => this.#fixVite(r)))
		results.push(this.#applyFix(checkHooks(this.#cwd), (r) => this.#fixHooks(r)))
		results.push(this.#applyFix(checkLayout(this.#cwd), (r) => this.#fixLayout(r)))
		results.push(this.#applyFix(checkContextSetup(this.#cwd), (r) => this.#fixContextSetup(r)))
		results.push(
			this.#applyFix(checkAuthPage(this.#cwd, this.#config), (r) => this.#fixAuthPage(r))
		)
		results.push(this.#applyFix(checkEnvKeys(this.#cwd, this.#config), (r) => this.#fixEnvKeys(r)))
		results.push(checkEnvValues(this.#cwd, this.#config)) // never auto-fixable
		results.push(
			this.#applyFix(checkDataRoute(this.#cwd, this.#config), (r) => this.#fixDataRoute(r))
		)
		results.push(this.#applyFix(checkDeps(this.#cwd, this.#config), (r) => this.#fixDeps(r)))

		return results
	}

	#applyFix(result, fixFn) {
		if (!result.ok && result.fixable && this.#fix) return fixFn(result)
		return result
	}

	#fixConfig(result) {
		if (this.#config?.app) {
			// Migrate from app: routing key to routes: key
			const normalized = parseConfig(this.#config)
			const migrated = {
				adapter: this.#config.adapter,
				providers: this.#config.providers ?? [],
				cachedLogins: this.#config.cachedLogins ?? false,
				env: this.#config.env,
				routes: normalized.routes,
				rules: this.#config.rules ?? [],
				logging: this.#config.logging
			}
			writeFile(resolve(this.#cwd, 'kavach.config.js'), generateConfigFile(migrated))
			this.#config = migrated
			return { ...result, ok: true, message: 'migrated app key to routes key', fixed: true }
		}
		const defaults = {
			adapter: 'supabase',
			providers: [],
			cachedLogins: false,
			env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
			routes: { data: '/data', rpc: '/rpc' },
			rules: [{ path: '/', public: true }],
			logging: { enabled: true, level: 'info', table: 'runtime.system_logs' }
		}
		writeFile(resolve(this.#cwd, 'kavach.config.js'), generateConfigFile(defaults))
		this.#config = defaults
		return { ...result, ok: true, message: 'generated with defaults', fixed: true }
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

	#fixContextSetup(result) {
		const path = resolve(this.#cwd, 'src/routes/+layout.svelte')
		writeFile(path, patchLayoutSvelte(fileExists(path) ? readFile(path) : ''))
		return { ...result, ok: true, message: 'patched', fixed: true }
	}

	#fixAuthPage(result) {
		const segment = this.#config.routes?.auth?.replace(/^\//, '').split('/').pop()
		const path = result.path ?? resolve(this.#cwd, `src/routes/${segment}/+page.svelte`)
		writeFile(path, generateAuthPage(this.#config))
		return { ...result, ok: true, message: 'generated', fixed: true }
	}

	#fixDataRoute(result) {
		const deprecated = resolve(
			dirname(result.segmentDir),
			`deprecated_${basename(result.segmentDir)}`
		)
		renameFile(result.segmentDir, deprecated)
		const rel = deprecated.replace(`${this.#cwd}/`, '')
		return {
			...result,
			ok: true,
			message: `renamed to ${rel} — can be safely removed`,
			fixed: true
		}
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
