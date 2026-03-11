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
	class="bg-neutral-base border-neutral-inset relative flex min-h-14 w-full items-center justify-between border-b"
>
	{#if loading}
		<div class="bg-primary absolute top-0 left-0 h-1 w-full animate-pulse"></div>
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
					class="bg-neutral-base rounded border border-neutral-300 px-2 py-1 text-sm"
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
					{#each adapters as name (name)}
						<option value={name} selected={name === adapter}>{name}</option>
					{/each}
				</select>
			</div>
		{:else}
			<span class="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-400">{adapter}</span>
		{/if}

		{#if user}
			<nav class="flex gap-4 text-sm">
				<a href="/" class="text-neutral-600 hover:text-neutral-900">Home</a>
				<a href="/data" class="text-neutral-600 hover:text-neutral-900">Data</a>
				{#if user.role === 'admin'}
					<a href="/admin" class="text-neutral-600 hover:text-neutral-900">Admin</a>
				{/if}
				<a href="/logout" class="text-neutral-600 hover:text-neutral-900">Logout</a>
			</nav>
		{/if}
	</div>
</header>
