import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { parseConfig } from './config.js'
import { generateModule } from './generate.js'

export { parseConfig }
export { templates } from './templates.js'

const VIRTUAL_MODULES = ['$kavach/auth', '$kavach/config', '$kavach/routes', '$kavach/providers']

function parseDotEnvFile(filePath) {
	if (!existsSync(filePath)) return {}
	return Object.fromEntries(
		readFileSync(filePath, 'utf-8')
			.split('\n')
			.filter((line) => line && !line.startsWith('#') && line.includes('='))
			.map((line) => {
				const eqIndex = line.indexOf('=')
				let value = line.slice(eqIndex + 1).trim()
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1)
				}
				return [line.slice(0, eqIndex).trim(), value]
			})
	)
}

/**
 * Collect env vars from .env files and process.env (process.env wins).
 * Mirrors Vite's loadEnv precedence: .env → .env.[mode] → .env.local →
 * .env.[mode].local → process.env.
 */
function collectEnv(root, mode) {
	const fileEnv = [
		resolve(root, '.env'),
		resolve(root, `.env.${mode}`),
		resolve(root, '.env.local'),
		resolve(root, `.env.${mode}.local`)
	].reduce((acc, file) => Object.assign(acc, parseDotEnvFile(file)), {})
	return { ...fileEnv, ...process.env }
}

export function kavach(options = {}) {
	let config = null
	let configPath = null
	let viteRoot = null
	let viteMode = null

	return {
		name: 'kavach',

		configResolved(viteConfig) {
			configPath =
				options.configPath ?? resolve(viteConfig.root ?? process.cwd(), 'kavach.config.js')
			viteRoot = viteConfig.root ?? process.cwd()
			viteMode = viteConfig.mode ?? 'development'
		},

		resolveId(id) {
			if (VIRTUAL_MODULES.includes(id)) return `\0${id}`
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

		configureServer(server) {
			if (!configPath) return
			server.watcher.add(configPath)
			server.watcher.on('change', (file) => {
				if (file === configPath) {
					server.restart()
				}
			})
		},

		load(id) {
			if (!id.startsWith('\0$kavach/')) return
			if (!config)
				throw new Error(
					'kavach.config.js not found or invalid. Run `npx @kavach/cli init` to create one.'
				)

			const name = id.slice('\0$kavach/'.length)
			const env = viteRoot ? collectEnv(viteRoot, viteMode) : { ...process.env }
			return generateModule(name, config, env)
		}
	}
}
