import { resolve } from 'path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { parseConfig } from '@kavach/vite'
import { generateAuthPage, generateDataRoute } from '../generators.js'
import { readFile, writeFile, fileExists } from '../fs.js'

function detectTypeScript(cwd) {
	const hasTsConfig = fileExists(resolve(cwd, 'tsconfig.json'))
	const hasJsConfig = fileExists(resolve(cwd, 'jsconfig.json'))
	return hasTsConfig && !hasJsConfig
}

async function loadConfig(cwd) {
	const configPath = resolve(cwd, 'kavach.config.js')
	if (!fileExists(configPath)) {
		p.cancel('kavach.config.js not found. Run `kavach init` first.')
		process.exit(1)
	}
	const mod = await import(configPath)
	return parseConfig(mod.default)
}

async function confirmOverwrite(path) {
	if (!fileExists(path)) return true
	const overwrite = await p.confirm({
		message: `${path} already exists. Overwrite?`,
		initialValue: false
	})
	if (p.isCancel(overwrite)) {
		p.cancel('Cancelled.')
		process.exit(0)
	}
	return overwrite
}

async function addAuthPage(cwd) {
	p.intro(pc.bgCyan(pc.black(' kavach add auth-page ')))

	const config = await loadConfig(cwd)
	const authPagePath = resolve(cwd, 'src/routes', config.routes.auth, '+page.svelte')

	if (!(await confirmOverwrite(authPagePath))) {
		p.cancel('Skipped.')
		return
	}

	writeFile(authPagePath, generateAuthPage(config))
	p.outro(pc.green(`Auth page written to src/routes/${config.routes.auth}/+page.svelte`))
}

async function addRoutes(cwd) {
	p.intro(pc.bgCyan(pc.black(' kavach add routes ')))

	const config = await loadConfig(cwd)
	const useTypeScript = detectTypeScript(cwd)
	const ext = useTypeScript ? 'ts' : 'js'
	const dataRoutePath = resolve(cwd, 'src/routes', config.routes.data, `[...slug]/+server.${ext}`)

	if (!(await confirmOverwrite(dataRoutePath))) {
		p.cancel('Skipped.')
		return
	}

	writeFile(dataRoutePath, generateDataRoute())
	p.outro(pc.green(`Data route written to src/routes/${config.routes.data}/[...slug]/+server.${ext}`))
}

const SUBCOMMANDS = {
	'auth-page': addAuthPage,
	routes: addRoutes
}

export async function add(subcommand, cwd = process.cwd()) {
	const handler = SUBCOMMANDS[subcommand]
	if (!handler) {
		console.log(`Unknown subcommand: ${subcommand}`)
		console.log('Available: auth-page, routes')
		process.exit(1)
	}
	await handler(cwd)
}
