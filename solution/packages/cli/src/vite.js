import { resolve } from 'path'
import { parseConfig } from './config.js'
import { generateModule } from './generate.js'

const VIRTUAL_MODULES = ['$kavach/auth', '$kavach/config', '$kavach/routes', '$kavach/providers']

export function kavach(options = {}) {
	let config
	let configPath

	return {
		name: 'kavach',

		configResolved(viteConfig) {
			configPath =
				options.configPath ?? resolve(viteConfig.root ?? process.cwd(), 'kavach.config.js')
		},

		resolveId(id) {
			if (VIRTUAL_MODULES.includes(id)) return '\0' + id
		},

		async buildStart() {
			const target = configPath ?? options.configPath
			if (target) {
				try {
					const mod = await import(target)
					config = parseConfig(mod.default)
				} catch {
					// Config not found — will error on load
				}
			}
		},

		load(id) {
			if (!id.startsWith('\0$kavach/')) return
			if (!config)
				throw new Error(
					'kavach.config.js not found or invalid. Run `npx @kavach/cli init` to create one.'
				)

			const name = id.slice('\0$kavach/'.length)
			return generateModule(name, config)
		}
	}
}
