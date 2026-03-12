<script lang="ts">
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { page } from '$app/stores'
	import { onMount, setContext } from 'svelte'

	const title = 'Kavach'
	let { children, data } = $props()

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/docs', label: 'Docs' },
		{ href: '/demo', label: 'Demo' }
	]

	let kavachInstance = $state<any>(null)

	setContext('kavach', {
		get signIn() {
			return kavachInstance?.signIn
		},
		get signUp() {
			return kavachInstance?.signUp
		},
		get signOut() {
			return kavachInstance?.signOut
		},
		get onAuthChange() {
			return kavachInstance?.onAuthChange
		},
		get getCachedLogins() {
			return kavachInstance?.getCachedLogins
		},
		get removeCachedLogin() {
			return kavachInstance?.removeCachedLogin
		},
		get clearCachedLogins() {
			return kavachInstance?.clearCachedLogins
		}
	})

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')

		const instance = createKavach(adapter, { logger, invalidateAll })
		kavachInstance = instance
		instance.onAuthChange($page.url)
	})
</script>

<div class="flex h-screen flex-col">
	<header
		class="border-surface-z1 bg-surface-z1 text-surface-z8 flex w-full shrink-0 items-center justify-between border-b px-8 py-4"
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

	<div class="min-h-0 flex-1">
		{@render children()}
	</div>

	<footer
		class="border-surface-z3 text-surface-z6 flex shrink-0 items-center justify-between border-t px-8 py-3 text-xs"
	>
		<span>Kavach — Authentication made simple</span>
		<a href="/llms.txt" class="hover:text-primary transition-colors">llms.txt</a>
	</footer>
</div>
