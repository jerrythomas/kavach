<script lang="ts">
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { page } from '$app/stores'

	let { children } = $props()

	const mockups = [
		{ href: '/mockups', label: 'Index' },
		{ href: '/mockups/learn-a', label: 'Learn A' },
		{ href: '/mockups/learn-b', label: 'Learn B' },
		{ href: '/mockups/learn-c', label: 'Learn C' },
		{ href: '/mockups/demo-a', label: 'Demo A' },
		{ href: '/mockups/demo-b', label: 'Demo B' }
	]

	const current = $derived($page.url.pathname)
</script>

<div class="bg-surface-z0 text-surface-z9 flex h-screen flex-col">
	<!-- Mockup chrome bar -->
	<div
		class="border-surface-z3 bg-surface-z2 flex h-10 shrink-0 items-center gap-1 border-b px-4 text-xs"
	>
		<a
			href="/"
			class="text-surface-z6 hover:text-primary mr-3 flex items-center gap-1 transition-colors"
		>
			<span class="i-app-login h-3.5 w-3.5 rotate-180"></span>
			Back to site
		</a>
		<span class="bg-surface-z4 mr-2 h-4 w-px"></span>
		{#each mockups as m (m.href)}
			<a
				href={m.href}
				class="rounded px-2.5 py-1 font-medium transition-colors"
				class:bg-primary={current === m.href}
				class:text-on-primary={current === m.href}
				class:text-surface-z6={current !== m.href}
				class:hover:text-surface-z9={current !== m.href}
			>
				{m.label}
			</a>
		{/each}
		<div class="flex-1"></div>
		<ThemeSwitcherToggle />
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto">
		{@render children()}
	</div>
</div>
