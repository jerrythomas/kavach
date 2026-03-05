import { resolve } from 'path'
import { execSync } from 'child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
	promptAdapterSelection,
	promptProviderSelection,
	promptDataRoute,
	promptRpcRoute,
	promptLoggingConfig,
	promptAuthRoute,
	promptLogoutRoute,
	promptCachedLogins,
	promptRules,
	showValidationWarnings,
	showDDLInstructions
} from '../prompts.js'
import { parseConfig } from '@kavach/vite'
import { generateConfigFile, generateAuthPage, generateDataRoute, generateRpcRoute } from '../generators.js'
import { patchViteConfig, patchHooksServer, patchLayoutServer, patchEnvFile } from '../patchers.js'
import { readFile, writeFile, fileExists, detectPackageManager } from '../fs.js'
import { DEPENDENCIES, ADAPTER_DEPS, ADAPTER_ENV_DEFAULTS } from './constants.js'

export class InitCommand {
	#cwd
	#pm
	#config
	#parsed
	#useTypeScript
	#adapterName

	constructor(cwd = process.cwd()) {
		this.#cwd = cwd
	}

	async run() {
		p.intro(pc.bgCyan(pc.black(' kavach init ')))

		this.#validateProject()
		this.#detectTypeScript()
		await this.#checkExisting()
		await this.#promptAndConfig()
		this.#pm = detectPackageManager(this.#cwd)

		await this.#writeConfig()
		await this.#patchVite()
		await this.#patchHooks()
		await this.#patchLayout()
		await this.#generateAuthPage()
		await this.#generateDataRoute()
		await this.#generateRpcRoute()
		await this.#patchEnv()
		await this.#installDependencies()

		p.outro(pc.green('kavach initialized! Run your dev server to get started.'))
	}

	#validateProject() {
		if (!fileExists(resolve(this.#cwd, 'svelte.config.js'))) {
			p.cancel('No svelte.config.js found. Run this from a SvelteKit project root.')
			process.exit(1)
		}
	}

	#detectTypeScript() {
		const hasTsConfig = fileExists(resolve(this.#cwd, 'tsconfig.json'))
		const hasJsConfig = fileExists(resolve(this.#cwd, 'jsconfig.json'))

		this.#useTypeScript = hasTsConfig && !hasJsConfig

		if (this.#useTypeScript) {
			p.log.info('TypeScript detected')
		} else {
			p.log.info('JavaScript detected')
		}
	}

	async #checkExisting() {
		if (!fileExists(resolve(this.#cwd, 'kavach.config.js'))) return

		const overwrite = await p.confirm({
			message: 'kavach.config.js already exists. Overwrite?',
			initialValue: false
		})

		if (!overwrite || p.isCancel(overwrite)) {
			p.cancel('Setup cancelled.')
			process.exit(0)
		}
	}

	async #promptAndConfig() {
		const answers = {}

		// Step 1: Select adapter first
		this.#adapterName = await promptAdapterSelection()
		if (p.isCancel(this.#adapterName)) {
			p.cancel('Setup cancelled.')
			process.exit(0)
		}
		answers.adapter = this.#adapterName

		// Step 2: Select providers based on adapter capabilities
		const providerNames = await promptProviderSelection(this.#adapterName)
		if (p.isCancel(providerNames)) {
			p.cancel('Setup cancelled.')
			process.exit(0)
		}
		answers.providers = providerNames || []

		// Step 3: Data route (if supported)
		const dataResult = await promptDataRoute(this.#adapterName)
		if (!p.isCancel(dataResult)) {
			answers.dataRoute = dataResult.enabled ? dataResult.path : null
		}

		// Step 4: RPC route (if supported)
		const rpcResult = await promptRpcRoute(this.#adapterName)
		if (!p.isCancel(rpcResult)) {
			answers.rpcRoute = rpcResult.enabled ? rpcResult.path : null
		}

		// Step 5: Logging (if supported)
		const loggingResult = await promptLoggingConfig(this.#adapterName)
		if (!p.isCancel(loggingResult)) {
			answers.logging = loggingResult
		}

		// Step 6: Auth route
		answers.authRoute = await promptAuthRoute()
		if (p.isCancel(answers.authRoute)) {
			answers.authRoute = '(public)/auth'
		}

		// Step 7: Logout route
		answers.logoutRoute = await promptLogoutRoute()
		if (p.isCancel(answers.logoutRoute)) {
			answers.logoutRoute = '/logout'
		}

		// Step 8: Cached logins
		answers.cachedLogins = await promptCachedLogins()

		// Step 9: Rules
		answers.rules = await promptRules()

		// Build final config
		this.#config = this.#buildConfig(answers)
		this.#parsed = parseConfig(this.#config)

		// Show warnings if any
		await showValidationWarnings(this.#config, this.#adapterName)

		// Show DDL instructions if applicable
		await showDDLInstructions(this.#config, this.#adapterName)
	}

	#buildConfig(answers) {
		const { PROVIDER_DEFAULTS } = require('../prompts.js')
		const providers = (answers.providers || []).map((key) => {
			const defaults = {
				google: { name: 'google', label: 'Continue with Google' },
				github: { name: 'github', label: 'Continue with GitHub' },
				azure: { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
				magic: { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
				password: { mode: 'password', name: 'email', label: 'Sign in using' }
			}
			return defaults[key] || { name: key, label: key }
		})

		return {
			adapter: answers.adapter,
			providers,
			cachedLogins: answers.cachedLogins ?? false,
			logging: answers.logging || { enabled: false },
			env: ADAPTER_ENV_DEFAULTS[answers.adapter] || {},
			routes: {
				auth: answers.authRoute || '(public)/auth',
				data: answers.dataRoute || '(server)/data',
				logout: answers.logoutRoute || '/logout'
			},
			rpcRoute: answers.rpcRoute,
			dataRoute: answers.dataRoute,
			rules: answers.rules || []
		}
	}

	async #runStep(message, fn) {
		const s = p.spinner()
		s.start(message)
		try {
			await fn()
			s.stop(`${message} — done`)
		} catch (e) {
			s.stop(`${message} — failed: ${e.message}`)
			throw e
		}
	}

	async #writeConfig() {
		await this.#runStep('Writing kavach.config.js', () => {
			writeFile(resolve(this.#cwd, 'kavach.config.js'), generateConfigFile(this.#config))
		})
	}

	async #patchVite() {
		await this.#runStep('Patching vite.config.js', () => {
			const path = resolve(this.#cwd, 'vite.config.js')
			const content = readFile(path)
			if (!content) throw new Error('vite.config.js not found')
			writeFile(path, patchViteConfig(content))
		})
	}

	async #patchHooks() {
		const ext = this.#useTypeScript ? 'ts' : 'js'
		const hooksPath = resolve(this.#cwd, `src/hooks.server.${ext}`)

		await this.#runStep(`Patching src/hooks.server.${ext}`, () => {
			writeFile(hooksPath, patchHooksServer(readFile(hooksPath)))
		})
	}

	async #patchLayout() {
		const ext = this.#useTypeScript ? 'ts' : 'js'
		const layoutPath = resolve(this.#cwd, `src/routes/+layout.server.${ext}`)

		await this.#runStep(`Patching src/routes/+layout.server.${ext}`, () => {
			writeFile(layoutPath, patchLayoutServer(readFile(layoutPath)))
		})
	}

	async #generateAuthPage() {
		const path = resolve(this.#cwd, 'src/routes', this.#parsed.routes.auth, '+page.svelte')
		if (fileExists(path)) {
			p.log.info('Auth page already exists — skipped')
			return
		}
		await this.#runStep(`Creating auth page at ${this.#parsed.routes.auth}`, () => {
			writeFile(path, generateAuthPage(this.#parsed))
		})
	}

	async #generateDataRoute() {
		if (!this.#parsed.routes.data) return

		const ext = this.#useTypeScript ? 'ts' : 'js'
		const path = resolve(this.#cwd, 'src/routes', this.#parsed.routes.data, `[...slug]/+server.${ext}`)

		if (fileExists(path)) {
			p.log.info('Data route already exists — skipped')
			return
		}
		await this.#runStep(`Creating data route at ${this.#parsed.routes.data}`, () => {
			writeFile(path, generateDataRoute())
		})
	}

	async #generateRpcRoute() {
		if (!this.#parsed.routes.rpc) return

		const ext = this.#useTypeScript ? 'ts' : 'js'
		const path = resolve(this.#cwd, 'src/routes', this.#parsed.routes.rpc, `[...slug]/+server.${ext}`)

		if (fileExists(path)) {
			p.log.info('RPC route already exists — skipped')
			return
		}
		await this.#runStep(`Creating RPC route at ${this.#parsed.routes.rpc}`, () => {
			writeFile(path, generateRpcRoute())
		})
	}

	async #patchEnv() {
		await this.#runStep('Updating .env', () => {
			writeFile(resolve(this.#cwd, '.env'), patchEnvFile(readFile(resolve(this.#cwd, '.env')), this.#parsed.env))
		})
	}

	async #installDependencies() {
		const deps = [...DEPENDENCIES, ...(ADAPTER_DEPS[this.#parsed.adapter] ?? [])]
		const depsToInstall = this.#filterExistingDeps(deps)

		if (depsToInstall.length > 0) {
			await this.#runStep(`Installing dependencies with ${this.#pm}`, () => this.#install(depsToInstall))
		} else {
			p.log.info('All dependencies already installed — skipped')
		}

		if (!this.#isDepInstalled('@kavach/cli')) {
			await this.#runStep('Installing @kavach/cli as dev dependency', () => this.#install(['@kavach/cli'], true))
		}
	}

	#filterExistingDeps(deps) {
		return deps.filter((dep) => !this.#isDepInstalled(dep))
	}

	#isDepInstalled(dep) {
		const pkgJsonPath = resolve(this.#cwd, 'package.json')
		if (!fileExists(pkgJsonPath)) return false

		const pkgJson = JSON.parse(readFile(pkgJsonPath))
		const allDeps = {
			...pkgJson.dependencies,
			...pkgJson.devDependencies
		}

		return dep in allDeps
	}

	#install(deps, dev = false) {
		const cmd = this.#pm === 'bun' ? 'bun add' : 'npm install'
		const args = [...deps, dev && '--save-dev'].filter(Boolean).join(' ')
		execSync(`${cmd} ${args}`, { cwd: this.#cwd, stdio: 'pipe' })
	}
}

export async function init(cwd) {
	const cmd = new InitCommand(cwd)
	await cmd.run()
}
