<script>
	import { hackerMode } from './hacker.svelte'

	let { adapterId, adapterLabel } = $props()

	const adapterIcons = {
		supabase: 'i-auth-supabase',
		firebase: 'i-auth-firebase',
		convex: 'i-app-shield'
	}

	const icon = $derived(adapterIcons[adapterId] ?? 'i-app-shield')
	let showTooltip = $state(false)
</script>

<div
	class="fixed right-4 bottom-4 z-50 flex cursor-default flex-col items-center gap-1"
	role="status"
	aria-label="Powered by Kavach"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
>
	{#if showTooltip}
		<div
			class="bg-surface-z8 text-surface-z1 mb-1 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-lg"
		>
			Powered by Kavach · {adapterLabel} adapter
		</div>
	{/if}

	<div
		class="bg-surface-z1 border-surface-z3 flex flex-col items-center gap-1 rounded-xl border p-2 shadow-md transition-all duration-300
      {hackerMode.value ? 'border-warning-400 shadow-warning-200 animate-pulse' : ''}"
	>
		<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
			<span class="text-xs font-black">⬡</span>
		</div>
		<div class="bg-surface-z2 flex h-8 w-8 items-center justify-center rounded-lg">
			<span class="{icon} h-5 w-5" aria-hidden="true"></span>
		</div>
	</div>
</div>
