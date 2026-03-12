<script>
	import { List } from '@rokkit/ui'
	import { page } from '$app/stores'

	const docsItems = [
		{
			label: 'Getting Started',
			children: [
				{ label: 'Introduction', value: '/docs' },
				{ label: 'Quick Start', value: '/docs/quick-start' },
				{ label: 'Configuration', value: '/docs/configuration' }
			]
		},
		{
			label: 'Core Concepts',
			children: [
				{ label: 'Authentication', value: '/docs/authentication' },
				{ label: 'Authorization', value: '/docs/authorization' },
				{ label: 'Session Management', value: '/docs/session' }
			]
		},
		{
			label: 'Components',
			children: [
				{ label: 'AuthProvider', value: '/docs/components/auth-provider' },
				{ label: 'AuthButton', value: '/docs/components/auth-button' },
				{ label: 'AuthPage', value: '/docs/components/auth-page' },
				{ label: 'LoginCard', value: '/docs/components/login-card' }
			]
		},
		{
			label: 'Adapters',
			children: [
				{ label: 'Supabase', value: '/docs/adapters/supabase' },
				{ label: 'Firebase', value: '/docs/adapters/firebase' },
				{ label: 'Auth0', value: '/docs/adapters/auth0' },
				{ label: 'Amplify', value: '/docs/adapters/amplify' },
				{ label: 'Convex', value: '/docs/adapters/convex' }
			]
		},
		{
			label: 'Plugins & Tools',
			children: [
				{ label: 'Vite Plugin', value: '/docs/plugins/vite' },
				{ label: 'CLI Commands', value: '/docs/cli' },
				{ label: 'Sentry', value: '/docs/sentry' },
				{ label: 'Logger', value: '/docs/logger' }
			]
		}
	]
	let { children } = $props()
	let selected = $derived($page.url.pathname)
</script>

<div class="bg-surface-z1 text-surface-z7 flex h-full">
	<aside class="border-surface-z3 w-64 overflow-y-auto border-r p-4">
		<List
			items={docsItems}
			value={selected}
			fields={{ label: 'label', children: 'children', href: 'value' }}
			collapsible={true}
		/>
	</aside>
	<main class="flex-1 overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
