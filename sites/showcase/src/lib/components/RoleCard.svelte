<script>
	let { role, routes } = $props()
</script>

<div class="flex flex-col gap-3">
	<span class="text-ink-soft text-xs font-semibold tracking-wider uppercase">Your Role</span>

	<div class="bg-paper-mute rounded-lg px-3 py-2">
		<span class="font-mono text-sm font-bold {role === 'admin' ? 'text-warning' : 'text-primary'}">
			{role ?? 'unauthenticated'}
		</span>
	</div>

	<div class="flex flex-col gap-1">
		{#each routes as route (route.path)}
			<div class="flex items-center gap-2 text-xs">
				<span
					class="h-3 w-3 shrink-0 {route.allowed
						? 'i-app-shield text-success'
						: 'i-app-shield text-danger'}"
					aria-hidden="true"
				></span>
				<span class="font-mono {route.allowed ? 'text-ink' : 'text-ink-faint line-through'}">
					{route.path}
				</span>
			</div>
		{/each}
	</div>
</div>
