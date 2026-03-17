<script>
	import { List } from '@rokkit/ui'
	import { page } from '$app/stores'
	import { TableOfContents } from '@rokkit/app'

	const docsItems = [
		{ label: 'Why Kavach', value: '/docs/why-kavach' },
		{ label: 'Quick Start', value: '/docs/quick-start' },
		{ label: 'CLI', value: '/docs/cli' },
		{ label: 'Core Concepts', value: '/docs/core-concepts' },
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
			label: 'Reference',
			children: [
				{ label: 'Configuration', value: '/docs/configuration' },
				{ label: 'Vite Plugin', value: '/docs/plugins/vite' },
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
