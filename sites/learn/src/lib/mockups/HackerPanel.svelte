<script lang="ts">
	import { HACKER_LOG } from './fitness-data'
	interface Props {
		theme?: 'dark' | 'terminal'
	}
	let { theme = 'dark' }: Props = $props()
</script>

{#if theme === 'dark'}
	<div class="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
		<div class="mb-3 flex items-center gap-2">
			<span class="h-2 w-2 animate-pulse rounded-full bg-red-400"></span>
			<p class="text-xs font-semibold tracking-widest text-red-400 uppercase">
				Hacker Mode — Sentry Log
			</p>
		</div>
		<div class="flex flex-col gap-2">
			{#each HACKER_LOG as entry (entry.ts)}
				<div class="rounded-lg border border-red-500/10 bg-black/30 px-3 py-2 font-mono text-xs">
					<span class="text-white/30">{entry.ts}</span>
					<span class="ml-2 text-amber-400">{entry.method}</span>
					<span class="ml-2 text-white/80">{entry.path}</span>
					<span class="ml-2 text-red-400">role:{entry.role}</span>
					<span class="ml-2 text-white/40">→</span>
					<span class="ml-2 text-emerald-400">{entry.action}</span>
				</div>
			{/each}
		</div>
		<p class="mt-3 text-xs text-white/40">
			Kavach Sentry intercepted these requests before they reached your app.
		</p>
	</div>
{:else}
	<!-- Terminal theme (Option B) -->
	<div class="border-surface-z4 bg-surface-z0 rounded-xl border font-mono text-xs">
		<div class="border-surface-z3 flex items-center gap-2 border-b px-4 py-2">
			<span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
			<span class="text-surface-z5 ml-2">sentry.log</span>
		</div>
		<div class="space-y-1.5 p-4">
			{#each HACKER_LOG as entry (entry.ts)}
				<div>
					<span class="text-surface-z5">[{entry.ts}]</span>
					<span class="ml-2 text-amber-600">{entry.method}</span>
					<span class="text-surface-z7 ml-2">{entry.path}</span>
					<span class="ml-2 text-red-500">BLOCKED</span>
					<span class="text-surface-z5 ml-2">→ {entry.action}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
