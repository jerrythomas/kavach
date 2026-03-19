<script lang="ts">
	import type { Athlete } from './fitness-data'
	interface Props {
		athlete: Athlete
	}
	let { athlete }: Props = $props()
	import ProgressRing from './ProgressRing.svelte'
	const pct = $derived(Math.round((athlete.progress.completed / athlete.progress.total) * 100))
</script>

<div class="rounded-2xl border border-cyan-500/20 bg-white/5 p-5">
	<div class="mb-4 flex items-start justify-between">
		<div>
			<p class="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Today's Workout</p>
			<h3 class="mt-1 text-lg font-bold text-white">{athlete.todayWorkout.name}</h3>
			<p class="text-xs text-white/50">{athlete.todayWorkout.duration}</p>
		</div>
		<ProgressRing {pct} label="{pct}%" />
	</div>
	<ul class="mb-4 flex flex-col gap-1.5">
		{#each athlete.todayWorkout.exercises as ex (ex)}
			<li class="flex items-center gap-2 text-sm text-white/70">
				<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
				{ex}
			</li>
		{/each}
	</ul>
	<div class="flex items-center gap-4 border-t border-white/10 pt-4 text-xs text-white/50">
		<span>🔥 {athlete.progress.streak}-day streak</span>
		<span>{athlete.progress.completed}/{athlete.progress.total} sessions</span>
	</div>
</div>
