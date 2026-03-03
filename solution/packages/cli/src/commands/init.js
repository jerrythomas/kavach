import * as p from '@clack/prompts'
import pc from 'picocolors'
import { buildConfig, PROVIDER_DEFAULTS } from '../prompts.js'

export async function init() {
	p.intro(pc.bgCyan(pc.black(' kavach init ')))

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
	return config
}
