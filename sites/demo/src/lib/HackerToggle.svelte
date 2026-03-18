<script>
	import { hackerMode } from './hacker.svelte'
</script>

<div class="flex flex-col gap-2">
	<span class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Mode</span>
	<button
		onclick={hackerMode.toggle}
		class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200
      {hackerMode.value
			? 'border-warning-400 bg-warning-50 text-warning-800'
			: 'border-surface-z3 bg-surface-z0 text-surface-z7 hover:border-primary'}"
		title={hackerMode.value
			? 'Hacker Mode on — click to return to App Mode'
			: 'App Mode — click to enter Hacker Mode'}
	>
		<span>{hackerMode.value ? '💀 Hacker Mode' : '✅ App Mode'}</span>
		<span class="text-surface-z4 text-xs">{hackerMode.value ? 'on' : 'off'}</span>
	</button>
	{#if hackerMode.value}
		<p class="text-warning-700 text-xs leading-relaxed">
			UI shows all routes. Security enforcement is surfaced visually when you trigger a protected
			action.
		</p>
	{/if}
</div>
