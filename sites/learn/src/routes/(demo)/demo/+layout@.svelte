<script lang="ts">
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'

	let { children } = $props()

	const kavach = $state<Record<string, any>>({})
	setContext('kavach', kavach)

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')
		const instance = createKavach(adapter, { logger, invalidateAll })
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
	})
</script>

<div class="demo-grid-bg bg-surface-z0 text-surface-z9 flex h-screen flex-col overflow-hidden">
	<!-- Theme switcher — fixed so it doesn't scroll away -->
	<div class="fixed top-4 right-4 z-10">
		<ThemeSwitcherToggle />
	</div>

	<!-- Page content — scrolls independently -->
	<div class="flex-1 overflow-y-auto">
		{@render children()}
	</div>

	<!-- Footer -->
	<footer class="border-surface-z2 text-surface-z5 shrink-0 border-t px-8 py-4 text-center text-sm">
		<a href="/" class="hover:text-primary transition-colors">← Back to Kavach</a>
	</footer>
</div>
