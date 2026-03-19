<script>
	import { List } from '@rokkit/ui'
	import { page } from '$app/stores'
	import { TableOfContents } from '@rokkit/app'

	const docsItems = [
		{ label: 'Why Kavach', value: '/docs/why-kavach', icon: 'i-app-shield' },
		{ label: 'Quick Start', value: '/docs/quick-start', icon: 'i-app-login' },
		{ label: 'CLI', value: '/docs/cli', icon: 'i-app-code-visible' },
		{ label: 'Core Concepts', value: '/docs/core-concepts', icon: 'i-app-list' },
		{
			label: 'Adapters',
			value: '/docs/adapters',
			children: [
				{ label: 'Supabase', value: '/docs/adapters/supabase', icon: 'i-auth-supabase' },
				{ label: 'Firebase', value: '/docs/adapters/firebase', icon: 'i-auth-firebase' },
				{ label: 'Auth0', value: '/docs/adapters/auth0', icon: 'i-app-shield' },
				{ label: 'Amplify', value: '/docs/adapters/amplify', icon: 'i-app-shield' },
				{ label: 'Convex', value: '/docs/adapters/convex', icon: 'i-app-shield' }
			]
		},
		{
			label: 'Reference',
			children: [
				{ label: 'Configuration', value: '/docs/configuration', icon: 'i-app-list' },
				{ label: 'Vite Plugin', value: '/docs/plugins/vite', icon: 'i-app-code-visible' },
				{ label: 'Sentry', value: '/docs/sentry', icon: 'i-app-shield' },
				{ label: 'Logger', value: '/docs/logger', icon: 'i-app-list' }
			]
		}
	]

	let { children } = $props()
	let selected = $derived($page.url.pathname)
</script>

<div class="text-surface-z7 flex h-full">
	<aside class="border-surface-z3 w-64 overflow-y-auto border-r p-4">
		<List
			items={docsItems}
			value={selected}
			fields={{ label: 'label', children: 'children', href: 'value', icon: 'icon' }}
			collapsible={true}
		/>
	</aside>
	<div class="flex min-w-0 flex-1 overflow-hidden">
		<main id="main-content" class="min-w-0 flex-1 overflow-y-auto p-8">
			{@render children()}
		</main>
		<aside
			class="border-surface-z3 hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-l px-5 py-6 xl:flex"
		>
			<TableOfContents />
		</aside>
	</div>
</div>
