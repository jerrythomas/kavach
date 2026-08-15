<script>
	import { hackerMode } from '../state/hacker.svelte'

	let { adapterId, adapterLabel } = $props()

	/** @type {Record<string, string>} */
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
		<div class="bg-ink text-paper mb-1 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-lg">
			Powered by Kavach · {adapterLabel} adapter
		</div>
	{/if}

	<div
		class="bg-paper-soft border-paper-edge flex flex-col items-center gap-1 rounded-xl border p-2 shadow-md transition-all duration-300
      {hackerMode.value ? 'border-warning animate-pulse' : ''}"
	>
		<div class="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-lg">
			<span class="text-xs font-black">⬡</span>
		</div>
		<div class="bg-paper-mute flex h-8 w-8 items-center justify-center rounded-lg">
			<span class="{icon} h-5 w-5" aria-hidden="true"></span>
		</div>
	</div>
</div>
