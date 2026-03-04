<script lang="ts">
	import 'uno.css'
	import '../app.css'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { page } from '$app/stores'

	const title = 'Kavach'

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/auth', label: 'Demo' }
	]
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Authentication made simple with Kavach" />
</svelte:head>

<header class="flex w-full justify-between px-8 py-4 border-b border-surface-z1 items-center">
	<div class="flex items-center gap-8">
		<h1 class="text-xl font-bold">
			<a href="/" class="hover:text-primary transition-colors">{title}</a>
		</h1>
		<nav class="flex gap-6">
			{#each navItems as item}
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

<slot />

