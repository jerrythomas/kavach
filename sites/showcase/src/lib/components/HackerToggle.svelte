<script>
	import { hackerMode } from '../state/hacker.svelte'
</script>

<div class="flex flex-col gap-2">
	<span class="text-ink-soft text-xs font-semibold tracking-wider uppercase">Mode</span>
	<button
		onclick={hackerMode.toggle}
		class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200
      {hackerMode.value
			? 'border-warning bg-warning-soft text-warning'
			: 'border-paper-edge bg-paper text-ink-mute hover:border-primary'}"
		title={hackerMode.value
			? 'Hacker Mode on — click to return to App Mode'
			: 'App Mode — click to enter Hacker Mode'}
	>
		<span>{hackerMode.value ? '💀 Hacker Mode' : '✅ App Mode'}</span>
		<span class="text-ink-faint text-xs">{hackerMode.value ? 'on' : 'off'}</span>
	</button>
	{#if hackerMode.value}
		<p class="text-warning text-xs leading-relaxed">
			UI shows all routes. Security enforcement is surfaced visually when you trigger a protected
			action.
		</p>
	{/if}
</div>
