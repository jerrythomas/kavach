<script lang="ts">
	import 'uno.css'
	import '../app.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { page } from '$app/stores'

	const title = 'Kavach'
	let { children } = $props()
	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/docs', label: 'Docs' },
		{ href: '/auth', label: 'Demo' }
	]
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Authentication made simple with Kavach" />
</svelte:head>
<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

<header
	class="flex w-full justify-between px-8 py-4 border-b border-surface-z1 bg-surface-z1 text-surface-z8 items-center"
>
	<div class="flex items-center gap-8">
		<h1 class="text-xl font-bold">
			<a href="/" class="hover:text-primary transition-colors flex flex-row items-center gap-2">
				<img src="/brand/kavach.svg" alt="Kavach Logo" class="w-6 h-6" />
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

{@render children()}
