<script lang="ts">
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { page } from '$app/stores'

	const title = 'Kavach'
	let { children } = $props()

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/docs', label: 'Docs' },
		{ href: '/demo', label: 'Demo' }
	]
</script>

<div class="demo-grid-bg bg-surface-z0 flex h-screen flex-col">
	<header
		class="border-surface-z2 bg-surface-z1 text-surface-z8 flex w-full shrink-0 items-center justify-between border-b px-8 py-4"
	>
		<div class="flex items-center gap-8">
			<h1 class="text-xl font-bold">
				<a href="/" class="hover:text-primary flex flex-row items-center gap-2 transition-colors">
					<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-6 w-6" />
					{title}
				</a>
			</h1>
			<nav class="flex gap-6">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="text-sm font-medium transition-colors"
						class:text-primary={$page.url.pathname === item.href}
						class:text-surface-z7={$page.url.pathname !== item.href}
						class:hover:text-primary={$page.url.pathname !== item.href}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
		<ThemeSwitcherToggle />
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto">
		{@render children()}
	</div>
</div>
