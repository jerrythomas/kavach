<script lang="ts">
	interface RouteAccess {
		path: string
		roles: string | string[]
		allowed: boolean
	}

	let {
		role,
		routes
	}: {
		role: string | null
		routes: RouteAccess[]
	} = $props()
</script>

<div class="flex flex-col gap-3">
	<span class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Your Role</span>

	<div class="bg-surface-z2 rounded-lg px-3 py-2">
		<span
			class="font-mono text-sm font-bold
        {role === 'admin' ? 'text-warning-600' : 'text-primary'}"
		>
			{role ?? 'unauthenticated'}
		</span>
	</div>

	<div class="flex flex-col gap-1">
		{#each routes as route}
			<div class="flex items-center gap-2 text-xs">
				<span
					class="h-3 w-3 shrink-0 {route.allowed
						? 'i-app-shield text-success-600'
						: 'i-app-shield text-error-400'}"
					aria-hidden="true"
				></span>
				<span
					class="font-mono {route.allowed ? 'text-surface-z7' : 'text-surface-z4 line-through'}"
				>
					{route.path}
				</span>
			</div>
		{/each}
	</div>
</div>
