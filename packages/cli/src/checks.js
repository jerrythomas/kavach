import { resolve } from 'path'
import { readFile, fileExists } from './fs.js'
import { DEPENDENCIES, ADAPTER_DEPS } from './commands/constants.js'

export function checkConfig(cwd, config) {
	const configPath = resolve(cwd, 'kavach.config.js')
	if (!fileExists(configPath)) {
		return {
			id: 'config',
			ok: false,
			label: 'kavach.config.js',
			message: 'not found',
			hint: 'Run kavach init',
			fixable: false
		}
	}
	if (!config) {
		return {
			id: 'config',
			ok: false,
			label: 'kavach.config.js',
			message: 'could not be parsed',
			hint: 'Run kavach init',
			fixable: false
		}
	}
	const missing = ['adapter', 'env', 'rules'].filter((k) => !(k in config))
	if (missing.length > 0) {
		return {
			id: 'config',
			ok: false,
			label: 'kavach.config.js',
			message: `missing fields: ${missing.join(', ')}`,
			hint: 'Run kavach init',
			fixable: false
		}
	}
	return { id: 'config', ok: true, label: 'kavach.config.js', message: 'valid' }
}

export function checkVite(cwd) {
	const candidates = ['vite.config.ts', 'vite.config.js'].map((f) => resolve(cwd, f))
	const path = candidates.find((p) => fileExists(p))
	if (!path) {
		return {
			id: 'vite',
			ok: false,
			label: 'vite.config.js',
			message: 'not found',
			hint: 'Run kavach init',
			fixable: false
		}
	}
	const label = path.endsWith('.ts') ? 'vite.config.ts' : 'vite.config.js'
	const content = readFile(path)
	if (!content.includes("from '@kavach/vite'")) {
		return {
			id: 'vite',
			ok: false,
			label,
			message: 'kavach() plugin missing',
			hint: 'Run kavach doctor --fix',
			fixable: true,
			path
		}
	}
	return { id: 'vite', ok: true, label, message: 'valid' }
}

export function checkHooks(cwd) {
	const candidates = ['src/hooks.server.ts', 'src/hooks.server.js'].map((f) => resolve(cwd, f))
	const path = candidates.find((p) => fileExists(p))
	if (!path) {
		return {
			id: 'hooks',
			ok: false,
			label: 'hooks.server',
			message: 'not found',
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}
	const label = path.endsWith('.ts') ? 'hooks.server.ts' : 'hooks.server.js'
	const content = readFile(path)
	if (!content.includes('$kavach/auth') || !content.includes('kavach.handle')) {
		return {
			id: 'hooks',
			ok: false,
			label,
			message: "must import from '$kavach/auth' and export kavach.handle",
			hint: 'Run kavach doctor --fix',
			fixable: true,
			path
		}
	}
	return { id: 'hooks', ok: true, label, message: 'valid' }
}

export function checkLayout(cwd) {
	const candidates = ['src/routes/+layout.server.ts', 'src/routes/+layout.server.js'].map((f) =>
		resolve(cwd, f)
	)
	const path = candidates.find((p) => fileExists(p))
	if (!path) {
		return {
			id: 'layout',
			ok: false,
			label: '+layout.server',
			message: 'not found',
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}
	const label = path.endsWith('.ts') ? '+layout.server.ts' : '+layout.server.js'
	const content = readFile(path)
	if (!content.includes('locals.session')) {
		return {
			id: 'layout',
			ok: false,
			label,
			message: 'does not pass session from locals',
			hint: 'Run kavach doctor --fix',
			fixable: true,
			path
		}
	}
	return { id: 'layout', ok: true, label, message: 'valid' }
}

export function checkEnvKeys(cwd, config) {
	if (!config?.env || Object.keys(config.env).length === 0) {
		return { id: 'env-keys', ok: true, label: '.env', message: 'no env config' }
	}
	const envPath = resolve(cwd, '.env')
	const present = new Set()
	if (fileExists(envPath)) {
		readFile(envPath)
			.split('\n')
			.forEach((line) => {
				const key = line.split('=')[0].trim()
				if (key) present.add(key)
			})
	}
	const missing = Object.values(config.env).filter((k) => !present.has(k))
	if (missing.length > 0) {
		return {
			id: 'env-keys',
			ok: false,
			label: '.env',
			message: `missing keys: ${missing.join(', ')}`,
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}
	return { id: 'env-keys', ok: true, label: '.env', message: 'all keys present' }
}

export function checkEnvValues(cwd, config) {
	if (!config?.env || Object.keys(config.env).length === 0) {
		return { id: 'env-values', ok: true, label: '.env values', message: 'no env config' }
	}
	const envPath = resolve(cwd, '.env')
	const values = {}
	if (fileExists(envPath)) {
		readFile(envPath)
			.split('\n')
			.forEach((line) => {
				const idx = line.indexOf('=')
				if (idx > 0) values[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
			})
	}
	const empty = Object.values(config.env).filter((k) => !values[k])
	if (empty.length > 0) {
		return {
			id: 'env-values',
			ok: false,
			label: '.env',
			message: `empty values: ${empty.join(', ')}`,
			hint: empty.map((k) => `set ${k}=<your-value> in .env`).join('\n        '),
			fixable: false
		}
	}
	return { id: 'env-values', ok: true, label: '.env values', message: 'all values set' }
}

export function checkDeps(cwd, config) {
	const pkgPath = resolve(cwd, 'package.json')
	if (!fileExists(pkgPath)) {
		return {
			id: 'deps',
			ok: false,
			label: 'dependencies',
			message: 'package.json not found',
			fixable: false
		}
	}
	const pkg = JSON.parse(readFile(pkgPath))
	const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
	const required = [...DEPENDENCIES, ...(ADAPTER_DEPS[config?.adapter] ?? [])]
	const missing = required.filter((d) => !(d in allDeps))
	if (missing.length > 0) {
		return {
			id: 'deps',
			ok: false,
			label: 'dependencies',
			message: `missing: ${missing.join(', ')}`,
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}
	return { id: 'deps', ok: true, label: 'dependencies', message: 'all installed' }
}
