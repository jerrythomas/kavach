<script lang="ts">
	interface Rule {
		path: string
		roles: string | string[]
		allowed: boolean
	}

	let { rules }: { rules: Rule[] } = $props()
	let open = $state(false)
</script>

<div class="flex flex-col gap-2">
	<button
		onclick={() => (open = !open)}
		class="text-surface-z5 hover:text-surface-z8 flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition-colors"
	>
		<span>Sentry Config</span>
		<span class="i-app-list h-3 w-3 transition-transform {open ? 'rotate-90' : ''}"></span>
	</button>

	{#if open}
		<div class="border-surface-z2 flex flex-col gap-1 rounded-lg border p-2">
			{#each rules as rule}
				<div class="flex items-center gap-2 py-0.5">
					<span
						class="h-2 w-2 shrink-0 rounded-full {rule.allowed ? 'bg-success-500' : 'bg-error-400'}"
					></span>
					<span class="text-surface-z6 min-w-0 flex-1 truncate font-mono text-xs">{rule.path}</span>
					<span class="text-surface-z4 shrink-0 font-mono text-xs">
						{Array.isArray(rule.roles) ? rule.roles.join(', ') : rule.roles}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
