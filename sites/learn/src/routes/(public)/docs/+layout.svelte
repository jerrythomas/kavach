<script>
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
	<aside
		class="border-surface-z3 bg-surface-z1 flex w-72 shrink-0 flex-col overflow-y-auto border-r"
	>
		<!-- Inline search (visual, non-functional for now) -->
		<div class="border-surface-z3 border-b p-4">
			<div
				class="border-surface-z4 bg-surface-z2 text-surface-z5 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
			>
				<span class="i-app-code-visible h-4 w-4 shrink-0"></span>
				Search docs…
				<span class="border-surface-z4 ml-auto rounded border px-1 font-mono text-xs">⌘K</span>
			</div>
		</div>

		<!-- Nav -->
		<nav class="flex-1 overflow-y-auto p-4">
			{#each docsItems as item (item.value ?? item.label)}
				{#if item.children}
					<div class="mb-1">
						<p
							class="text-surface-z5 mt-3 mb-1 px-2 text-xs font-semibold tracking-wider uppercase"
						>
							{item.label}
						</p>
						{#each item.children as child (child.value)}
							<a
								href={child.value}
								class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
								class:bg-primary={selected === child.value}
								class:text-on-primary={selected === child.value}
								class:text-surface-z7={selected !== child.value}
								class:hover:bg-surface-z2={selected !== child.value}
							>
								{#if child.icon}
									<span class="{child.icon} h-4 w-4 shrink-0" aria-hidden="true"></span>
								{/if}
								{child.label}
							</a>
						{/each}
					</div>
				{:else}
					<a
						href={item.value}
						class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
						class:bg-primary={selected === item.value}
						class:text-on-primary={selected === item.value}
						class:text-surface-z7={selected !== item.value}
						class:hover:bg-surface-z2={selected !== item.value}
					>
						{#if item.icon}
							<span class="{item.icon} h-4 w-4 shrink-0" aria-hidden="true"></span>
						{/if}
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>
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
