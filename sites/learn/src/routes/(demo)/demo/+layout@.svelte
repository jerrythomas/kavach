<script lang="ts">
	import 'uno.css'
	import '../../../app.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { ThemeSwitcherToggle } from '@rokkit/app'

	let { children } = $props()
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
