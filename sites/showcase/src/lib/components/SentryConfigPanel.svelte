<script>
	let { rules } = $props()
	let open = $state(false)
</script>

<div class="flex flex-col gap-2">
	<button
		onclick={() => (open = !open)}
		class="text-ink-soft hover:text-ink flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition-colors"
	>
		<span>Sentry Config</span>
		<span class="i-app-list h-3 w-3 transition-transform {open ? 'rotate-90' : ''}"></span>
	</button>

	{#if open}
		<div class="border-paper-edge flex flex-col gap-1 rounded-lg border p-2">
			{#each rules as rule (rule.path)}
				<div class="flex items-center gap-2 py-0.5">
					<span class="h-2 w-2 shrink-0 rounded-full {rule.allowed ? 'bg-success' : 'bg-danger'}"
					></span>
					<span class="text-ink-soft min-w-0 flex-1 truncate font-mono text-xs">{rule.path}</span>
					<span class="text-ink-faint shrink-0 font-mono text-xs">
						{Array.isArray(rule.roles) ? rule.roles.join(', ') : rule.roles}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
