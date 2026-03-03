import { resolve, join } from 'path'
import { execSync } from 'child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { buildConfig, PROVIDER_DEFAULTS } from '../prompts.js'
import { parseConfig } from '../config.js'
import { generateConfigFile, generateAuthPage, generateDataRoute } from '../generators.js'
import { patchViteConfig, patchHooksServer, patchLayoutServer, patchEnvFile } from '../patchers.js'
import { readFile, writeFile, fileExists, detectPackageManager } from '../fs.js'

export async function init(cwd = process.cwd()) {
	p.intro(pc.bgCyan(pc.black(' kavach init ')))

	// Check for SvelteKit project
	if (!fileExists(resolve(cwd, 'svelte.config.js'))) {
		p.cancel('No svelte.config.js found. Run this from a SvelteKit project root.')
		process.exit(1)
	}

	// Check if already initialized
	if (fileExists(resolve(cwd, 'kavach.config.js'))) {
		const overwrite = await p.confirm({
			message: 'kavach.config.js already exists. Overwrite?',
			initialValue: false
		})
		if (!overwrite || p.isCancel(overwrite)) {
			p.cancel('Setup cancelled.')
			process.exit(0)
		}
	}

	const answers = await p.group(
		{
			adapter: () =>
				p.select({
					message: 'Which auth adapter?',
					options: [{ value: 'supabase', label: 'Supabase' }]
				}),
			providers: () =>
				p.multiselect({
					message: 'Which auth providers?',
					options: Object.entries(PROVIDER_DEFAULTS).map(([key, def]) => ({
						value: key,
						label: def.label
					})),
					required: false
				}),
			cachedLogins: () =>
				p.confirm({
					message: 'Enable cached logins?',
					initialValue: false
				}),
			logLevel: () =>
				p.select({
					message: 'Log level?',
					options: [
						{ value: 'error', label: 'error' },
						{ value: 'warn', label: 'warn' },
						{ value: 'info', label: 'info' },
						{ value: 'debug', label: 'debug' },
						{ value: 'trace', label: 'trace' }
					],
					initialValue: 'error'
				}),
			logTable: () =>
				p.text({
					message: 'Log table name?',
					placeholder: 'logs',
					defaultValue: 'logs'
				}),
			authRoute: () =>
				p.text({
					message: 'Auth route path?',
					placeholder: '(public)/auth',
					defaultValue: '(public)/auth'
				}),
			dataRoute: () =>
				p.text({
					message: 'Data route path?',
					placeholder: '(server)/data',
					defaultValue: '(server)/data'
				}),
			logoutRoute: () =>
				p.text({
					message: 'Logout route path?',
					placeholder: '/logout',
					defaultValue: '/logout'
				})
		},
		{
			onCancel: () => {
				p.cancel('Setup cancelled.')
				process.exit(0)
			}
		}
	)

	const config = buildConfig(answers)
	const parsed = parseConfig(config)
	const s = p.spinner()

	// 1. Generate kavach.config.js
	s.start('Writing kavach.config.js')
	writeFile(resolve(cwd, 'kavach.config.js'), generateConfigFile(config))
	s.stop('kavach.config.js created')

	// 2. Patch vite.config.js
	s.start('Patching vite.config.js')
	const vitePath = resolve(cwd, 'vite.config.js')
	const viteContent = readFile(vitePath)
	if (viteContent) {
		writeFile(vitePath, patchViteConfig(viteContent))
		s.stop('vite.config.js patched')
	} else {
		s.stop('vite.config.js not found — skipped')
	}

	// 3. Patch hooks.server.js
	s.start('Patching src/hooks.server.js')
	const hooksPath = resolve(cwd, 'src/hooks.server.js')
	const hooksContent = readFile(hooksPath)
	writeFile(hooksPath, patchHooksServer(hooksContent))
	s.stop('src/hooks.server.js patched')

	// 4. Patch +layout.server.js
	s.start('Patching src/routes/+layout.server.js')
	const layoutServerPath = resolve(cwd, 'src/routes/+layout.server.js')
	const layoutServerContent = readFile(layoutServerPath)
	writeFile(layoutServerPath, patchLayoutServer(layoutServerContent))
	s.stop('src/routes/+layout.server.js patched')

	// 5. Generate auth page
	const authPagePath = resolve(cwd, 'src/routes', parsed.routes.auth, '+page.svelte')
	if (!fileExists(authPagePath)) {
		s.start(`Creating auth page at ${parsed.routes.auth}`)
		writeFile(authPagePath, generateAuthPage(parsed))
		s.stop('Auth page created')
	} else {
		p.log.info('Auth page already exists — skipped')
	}

	// 6. Generate data route
	const dataRoutePath = resolve(cwd, 'src/routes', parsed.routes.data, '[...slug]/+server.js')
	if (!fileExists(dataRoutePath)) {
		s.start(`Creating data route at ${parsed.routes.data}`)
		writeFile(dataRoutePath, generateDataRoute())
		s.stop('Data route created')
	} else {
		p.log.info('Data route already exists — skipped')
	}

	// 7. Patch .env
	s.start('Updating .env')
	const envPath = resolve(cwd, '.env')
	const envContent = readFile(envPath)
	writeFile(envPath, patchEnvFile(envContent, parsed.env))
	s.stop('.env updated')

	// 8. Install dependencies
	const pm = detectPackageManager(cwd)
	const deps = ['kavach', '@kavach/ui', '@kavach/query', '@kavach/logger']
	const adapterDeps =
		parsed.adapter === 'supabase'
			? ['@kavach/adapter-supabase', '@supabase/supabase-js']
			: []
	const allDeps = [...deps, ...adapterDeps]

	s.start(`Installing dependencies with ${pm}`)
	try {
		const installCmd =
			pm === 'npm'
				? `npm install ${allDeps.join(' ')}`
				: `${pm} add ${allDeps.join(' ')}`
		execSync(installCmd, { cwd, stdio: 'pipe' })
		s.stop('Dependencies installed')
	} catch {
		s.stop(`Failed to install — run: ${pm} add ${allDeps.join(' ')}`)
	}

	// 9. Install dev dependency
	s.start('Installing @kavach/cli as dev dependency')
	try {
		const devCmd =
			pm === 'npm'
				? 'npm install -D @kavach/cli'
				: `${pm} add -D @kavach/cli`
		execSync(devCmd, { cwd, stdio: 'pipe' })
		s.stop('@kavach/cli installed')
	} catch {
		s.stop(`Failed — run: ${pm} add -D @kavach/cli`)
	}

	p.outro(pc.green('kavach initialized! Run your dev server to get started.'))
}
