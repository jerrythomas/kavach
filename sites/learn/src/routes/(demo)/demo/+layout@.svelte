<script lang="ts">
	import 'uno.css'
	import '../../../app.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'

	let { children } = $props()

	let kavachInstance = $state<any>(null)

	setContext('kavach', {
		get signIn() {
			return kavachInstance?.signIn
		},
		get signUp() {
			return kavachInstance?.signUp
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

<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

<div class="bg-surface-z0 text-surface-z9 relative min-h-screen">
	<!-- Kavach watermark -->
	<div
		class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
		aria-hidden="true"
	>
		<span class="text-surface-z2 text-[20vw] font-black tracking-tight opacity-30">KAVACH</span>
	</div>

	<!-- Theme switcher -->
	<div class="absolute top-4 right-4 z-10">
		<ThemeSwitcherToggle />
	</div>

	<!-- Page content -->
	<div class="relative z-10">
		{@render children()}
	</div>

	<!-- Footer -->
	<footer class="border-surface-z2 text-surface-z5 border-t px-8 py-4 text-center text-sm">
		<a href="/" class="hover:text-primary transition-colors">← Back to Kavach</a>
	</footer>
</div>
