import { resolve } from 'path'
import { parseConfig } from './config.js'
import { generateModule } from './generate.js'

const VIRTUAL_MODULES = ['$kavach/auth', '$kavach/config', '$kavach/routes', '$kavach/providers']

export class KavachPlugin {
	#config
	#configPath

	constructor(options = {}) {
		this.options = options
		this.name = 'kavach'
	}

	configResolved(viteConfig) {
		this.#configPath =
			this.options.configPath ?? resolve(viteConfig.root ?? process.cwd(), 'kavach.config.js')
	}

	resolveId(id) {
		if (VIRTUAL_MODULES.includes(id)) return '\0' + id
	}

	async buildStart() {
		const target = this.#configPath ?? this.options.configPath
		if (target) {
			try {
				const mod = await import(target)
				this.#config = parseConfig(mod.default)
			} catch {
				// Config not found — will error on load
			}
		}
	}

	load(id) {
		if (!id.startsWith('\0$kavach/')) return
		if (!this.#config)
			throw new Error(
				'kavach.config.js not found or invalid. Run `npx @kavach/cli init` to create one.'
			)

		const name = id.slice('\0$kavach/'.length)
		return generateModule(name, this.#config)
	}
}

export function kavach(options = {}) {
	return new KavachPlugin(options)
}
