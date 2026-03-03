import { resolve } from 'path'
import { execSync } from 'child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { buildConfig } from '../prompts.js'
import { parseConfig } from '../config.js'
import { generateConfigFile, generateAuthPage, generateDataRoute } from '../generators.js'
import { patchViteConfig, patchHooksServer, patchLayoutServer, patchEnvFile } from '../patchers.js'
import { readFile, writeFile, fileExists, detectPackageManager } from '../fs.js'
import { DEPENDENCIES, ADAPTER_DEPS, PROMPT_CONFIG } from './constants.js'

export class InitCommand {
	#cwd
	#pm
	#config
	#parsed

	constructor(cwd = process.cwd()) {
		this.#cwd = cwd
	}

	async run() {
		p.intro(pc.bgCyan(pc.black(' kavach init ')))

		this.#validateProject()
		await this.#checkExisting()
		await this.#promptAndConfig()
		this.#pm = detectPackageManager(this.#cwd)

		await this.#writeConfig()
		await this.#patchVite()
		await this.#patchHooks()
		await this.#patchLayout()
		await this.#generateAuthPage()
		await this.#generateDataRoute()
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
		const group = PROMPT_CONFIG.reduce((acc, { key, type, getOptions, ...opts }) => {
			acc[key] = () => p[type]({ ...opts, options: getOptions?.() ?? opts.options })
			return acc
		}, {})

		const answers = await p.group(group, {
			onCancel: () => { p.cancel('Setup cancelled.'); process.exit(0) }
		})

		this.#config = buildConfig(answers)
		this.#parsed = parseConfig(this.#config)
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
		await this.#runStep('Patching src/hooks.server.js', () => {
			writeFile(resolve(this.#cwd, 'src/hooks.server.js'), patchHooksServer(readFile(resolve(this.#cwd, 'src/hooks.server.js'))))
		})
	}

	async #patchLayout() {
		await this.#runStep('Patching src/routes/+layout.server.js', () => {
			writeFile(resolve(this.#cwd, 'src/routes/+layout.server.js'), patchLayoutServer(readFile(resolve(this.#cwd, 'src/routes/+layout.server.js'))))
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
		const path = resolve(this.#cwd, 'src/routes', this.#parsed.routes.data, '[...slug]/+server.js')
		if (fileExists(path)) {
			p.log.info('Data route already exists — skipped')
			return
		}
		await this.#runStep(`Creating data route at ${this.#parsed.routes.data}`, () => {
			writeFile(path, generateDataRoute())
		})
	}

	async #patchEnv() {
		await this.#runStep('Updating .env', () => {
			writeFile(resolve(this.#cwd, '.env'), patchEnvFile(readFile(resolve(this.#cwd, '.env')), this.#parsed.env))
		})
	}

	async #installDependencies() {
		const deps = [...DEPENDENCIES, ...(ADAPTER_DEPS[this.#parsed.adapter] ?? [])]
		await this.#runStep(`Installing dependencies with ${this.#pm}`, () => this.#install(deps))
		await this.#runStep('Installing @kavach/cli as dev dependency', () => this.#install(['@kavach/cli'], true))
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
