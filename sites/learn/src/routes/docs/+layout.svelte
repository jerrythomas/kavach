<script>
	import { List } from '@rokkit/ui'
	import { page } from '$app/stores'

	const docsItems = [
		{
			text: 'Getting Started',
			children: [
				{ text: 'Introduction', value: '/docs' },
				{ text: 'Quick Start', value: '/docs/quick-start' },
				{ text: 'Configuration', value: '/docs/configuration' }
			]
		},
		{
			text: 'Core Concepts',
			children: [
				{ text: 'Authentication', value: '/docs/authentication' },
				{ text: 'Authorization', value: '/docs/authorization' },
				{ text: 'Session Management', value: '/docs/session' }
			]
		},
		{
			text: 'Components',
			children: [
				{ text: 'AuthProvider', value: '/docs/components/auth-provider' },
				{ text: 'AuthButton', value: '/docs/components/auth-button' },
				{ text: 'AuthPage', value: '/docs/components/auth-page' },
				{ text: 'LoginCard', value: '/docs/components/login-card' }
			]
		},
		{
			text: 'Adapters',
			children: [
				{ text: 'Supabase', value: '/docs/adapters/supabase' },
				{ text: 'Firebase', value: '/docs/adapters/firebase' },
				{ text: 'Auth0', value: '/docs/adapters/auth0' },
				{ text: 'Amplify', value: '/docs/adapters/amplify' },
				{ text: 'Convex', value: '/docs/adapters/convex' }
			]
		},
		{
			text: 'Plugins & Tools',
			children: [
				{ text: 'Vite Plugin', value: '/docs/plugins/vite' },
				{ text: 'CLI Commands', value: '/docs/cli' },
				{ text: 'Guardian', value: '/docs/guardian' },
				{ text: 'Logger', value: '/docs/logger' }
			]
		}
	]
	let { children } = $props()
	let selected = $derived($page.url.pathname)
</script>

<div class="flex h-full bg-surface-z1 text-surface-z7">
	<aside class="w-64 border-r border-surface-z3 p-4 overflow-y-auto">
		<List
			items={docsItems}
			value={selected}
			fields={{ text: 'text', children: 'children', href: 'value' }}
			collapsible={true}
		/>
	</aside>
	<main class="flex-1 p-8 overflow-y-auto">
		{@render children()}
	</main>
</div>
