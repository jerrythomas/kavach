import { resolve, join } from 'path'
import { readdirSync } from 'fs'
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
			hint: 'Run kavach init or kavach doctor --fix',
			fixable: true
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
	const APP_ROUTE_KEYS = ['home', 'login', 'logout', 'session', 'data', 'rpc']
	if (config.app && APP_ROUTE_KEYS.some((k) => k in config.app)) {
		return {
			id: 'config',
			ok: false,
			label: 'kavach.config.js',
			message: 'routing config uses app key — should use routes key',
			hint: 'Run kavach doctor --fix to migrate',
			fixable: true
		}
	}
	return { id: 'config', ok: true, label: 'kavach.config.js', message: 'valid', fixable: false }
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
	return { id: 'vite', ok: true, label, message: 'valid', fixable: false }
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
	return { id: 'hooks', ok: true, label, message: 'valid', fixable: false }
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
	return { id: 'layout', ok: true, label, message: 'valid', fixable: false }
}

export function checkEnvKeys(cwd, config) {
	if (!config?.env || Object.keys(config.env).length === 0) {
		return { id: 'env-keys', ok: true, label: '.env', message: 'no env config', fixable: false }
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
	return { id: 'env-keys', ok: true, label: '.env', message: 'all keys present', fixable: false }
}

export function checkEnvValues(cwd, config) {
	if (!config?.env || Object.keys(config.env).length === 0) {
		return {
			id: 'env-values',
			ok: true,
			label: '.env values',
			message: 'no env config',
			fixable: false
		}
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
	const empty = Object.values(config.env).filter((k) => k in values && !values[k])
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
	return {
		id: 'env-values',
		ok: true,
		label: '.env values',
		message: 'all values set',
		fixable: false
	}
}

function findLayoutSvelteFiles(dir) {
	const results = []
	try {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name)
			if (entry.isDirectory()) {
				results.push(...findLayoutSvelteFiles(full))
			} else if (entry.name === '+layout.svelte' || entry.name.startsWith('+layout@')) {
				results.push(full)
			}
		}
	} catch {
		// dir doesn't exist — return empty
	}
	return results
}

function collectAuthPage(full, segment, results) {
	const page = join(full, '+page.svelte')
	if (fileExists(page)) results.push(page)
}

function findAuthPageCandidates(dir, segment) {
	const results = []
	let entries
	try {
		entries = readdirSync(dir, { withFileTypes: true })
	} catch {
		return results
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		const full = join(dir, entry.name)
		if (entry.name === segment) collectAuthPage(full, segment, results)
		else results.push(...findAuthPageCandidates(full, segment))
	}
	return results
}

export function checkContextSetup(cwd) {
	const routesDir = resolve(cwd, 'src/routes')
	const layouts = findLayoutSvelteFiles(routesDir)

	if (layouts.length === 0) {
		return {
			id: 'layout-svelte',
			ok: false,
			label: '+layout.svelte',
			message: 'not found',
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}

	const hasContext = layouts.some((p) => readFile(p).includes("setContext('kavach'"))
	if (!hasContext) {
		return {
			id: 'layout-svelte',
			ok: false,
			label: '+layout.svelte',
			message: "setContext('kavach') missing",
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}

	return {
		id: 'layout-svelte',
		ok: true,
		label: '+layout.svelte',
		message: 'valid',
		fixable: false
	}
}

export function checkAuthPage(cwd, config) {
	if (!config?.routes?.auth) {
		return {
			id: 'auth-page',
			ok: true,
			label: 'auth page',
			message: 'no auth route configured',
			fixable: false
		}
	}

	const segment = config.routes.auth.replace(/^\//, '').split('/').pop()
	const routesDir = resolve(cwd, 'src/routes')
	const candidates = findAuthPageCandidates(routesDir, segment)

	if (candidates.length === 0) {
		return {
			id: 'auth-page',
			ok: false,
			label: 'auth page',
			message: 'not found',
			hint: 'Run kavach doctor --fix',
			fixable: true
		}
	}

	const found = candidates.find((p) => readFile(p).includes('AuthProvider'))
	if (!found) {
		const label = candidates[0].replace(`${routesDir}/`, '')
		return {
			id: 'auth-page',
			ok: false,
			label,
			message: 'AuthProvider missing',
			hint: 'Run kavach doctor --fix',
			fixable: true,
			path: candidates[0]
		}
	}

	return { id: 'auth-page', ok: true, label: 'auth page', message: 'valid', fixable: false }
}

function findSegmentDir(dir, segment) {
	let entries
	try {
		entries = readdirSync(dir, { withFileTypes: true })
	} catch {
		return null
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		const full = join(dir, entry.name)
		if (entry.name === segment) return full
		const found = findSegmentDir(full, segment)
		if (found) return found
	}
	return null
}

function hasServerFiles(dir) {
	try {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory() && hasServerFiles(join(dir, entry.name))) return true
			if (!entry.isDirectory() && entry.name.startsWith('+server.')) return true
		}
	} catch {
		// dir doesn't exist
	}
	return false
}

export function checkDataRoute(cwd, config) {
	if (!config?.routes?.data) {
		return {
			id: 'data-route',
			ok: true,
			label: 'data route',
			message: 'not configured',
			fixable: false
		}
	}
	const segment = config.routes.data.replace(/^\//, '').split('/').pop()
	const routesDir = resolve(cwd, 'src/routes')
	const segmentDir = findSegmentDir(routesDir, segment)

	if (!segmentDir || !hasServerFiles(segmentDir)) {
		return {
			id: 'data-route',
			ok: true,
			label: 'data route',
			message: 'no legacy route files',
			fixable: false
		}
	}

	const relDir = segmentDir.replace(`${routesDir}/`, '')
	return {
		id: 'data-route',
		ok: false,
		label: `src/routes/${relDir}/`,
		message: 'legacy route files found — kavach.handle manages this endpoint internally',
		hint: 'Run kavach doctor --fix to rename to deprecated_<folder> for safe removal',
		fixable: true,
		segmentDir
	}
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
	return { id: 'deps', ok: true, label: 'dependencies', message: 'all installed', fixable: false }
}
