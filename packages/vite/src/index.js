import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { parseConfig } from './config.js'
import { generateModule, generateDeclarations } from './generate.js'

export { parseConfig }
export { templates } from './templates.js'

const VIRTUAL_MODULES = ['$kavach/auth', '$kavach/config', '$kavach/routes', '$kavach/providers']

/**
 * Write declaration content to `filePath`, but only when it differs from what is
 * already on disk. Creates parent directories as needed. Returns true if written.
 */
export function writeDeclarationFile(filePath, content) {
	if (existsSync(filePath) && readFileSync(filePath, 'utf-8') === content) {
		return false
	}
	mkdirSync(dirname(filePath), { recursive: true })
	writeFileSync(filePath, content)
	return true
}

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
	const dtsOption = options.dts ?? 'src/kavach.d.ts'

	async function loadConfig() {
		if (config) return config
		const target = configPath ?? options.configPath
		if (!target) return null
		try {
			const mod = await import(target)
			config = parseConfig(mod.default)
		} catch {
			config = null
		}
		return config
	}

	function emitDeclarations() {
		if (dtsOption === false || !config || !viteRoot) return
		try {
			writeDeclarationFile(resolve(viteRoot, dtsOption), generateDeclarations())
		} catch {
			// best-effort: type generation must never break the build
		}
	}

	return {
		name: 'kavach',

		config() {
			return {
				ssr: {
					noExternal: ['kavach', /@kavach\/.*/]
				}
			}
		},

		async configResolved(viteConfig) {
			configPath =
				options.configPath ?? resolve(viteConfig.root ?? process.cwd(), 'kavach.config.js')
			viteRoot = viteConfig.root ?? process.cwd()
			viteMode = viteConfig.mode ?? 'development'
			await loadConfig()
			emitDeclarations()
		},

		resolveId(id) {
			if (VIRTUAL_MODULES.includes(id)) return `\0${id}`
		},

		async buildStart() {
			await loadConfig()
			emitDeclarations()
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
