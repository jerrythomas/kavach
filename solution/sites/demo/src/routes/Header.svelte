<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'

	export let title
	export let user
	export let adapter = 'supabase'
	export let adapters = []
	export let devMode = false

	let loading = false

	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header
	class="flex min-h-14 w-full bg-neutral-base items-center justify-between relative border-b border-neutral-inset"
>
	{#if loading}
		<div class="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
	{/if}
	<div class="flex items-center gap-2 px-4">
		<a href="/" class="flex items-center">
			<img src="favicon.png" alt="logo" class="aspect-square h-8" />
		</a>
		<p>{title}</p>
	</div>

	<div class="flex items-center gap-4 pr-4">
		{#if devMode && adapters.length > 1}
			<div class="flex items-center gap-2 text-sm">
				<span class="text-neutral-500">Adapter:</span>
				<select
					class="bg-neutral-base border border-neutral-300 rounded px-2 py-1 text-sm"
					value={adapter}
					onchange={async (e) => {
						await fetch('/api/set-adapter', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ adapter: e.target.value })
						})
						window.location.reload()
					}}
				>
					{#each adapters as name}
						<option value={name} selected={name === adapter}>{name}</option>
					{/each}
				</select>
			</div>
		{:else}
			<span class="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">{adapter}</span>
		{/if}

		{#if user}
			<a href="/logout" class="text-sm text-neutral-600 hover:text-neutral-800">Logout</a>
		{/if}
	</div>
</header>
