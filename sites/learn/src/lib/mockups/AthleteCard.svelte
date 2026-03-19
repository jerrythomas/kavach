<script lang="ts">
	import type { Athlete } from './fitness-data'
	interface Props {
		athlete: Athlete
		onclick?: () => void
	}
	let { athlete, onclick }: Props = $props()
	const pct = $derived(Math.round((athlete.progress.completed / athlete.progress.total) * 100))
</script>

<button
	{onclick}
	class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-cyan-500/30 hover:bg-white/10"
>
	<div
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400"
	>
		{athlete.name[0]}
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-white">{athlete.name}</p>
		<p class="truncate text-xs text-white/50">{athlete.plan}</p>
	</div>
	<div class="text-right">
		<p class="text-sm font-bold text-cyan-400">{pct}%</p>
		<p class="text-xs text-white/40">{athlete.progress.streak}d</p>
	</div>
</button>
