<script>
	let { data } = $props()
	const isAdmin = $derived(data?.user?.role === 'admin')

	let facts = $state([])
	let error = $state(null)
	let loading = $state(false)

	async function fetchFacts() {
		loading = true
		error = null
		try {
			const res = await fetch('/data/facts')
			if (!res.ok) {
				const body = await res.json()
				error = body.error ?? `HTTP ${res.status}`
			} else {
				facts = await res.json()
			}
		} catch (e) {
			error = e.message
		}
		loading = false
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold">Space Facts</h1>
		<p class="text-surface-z7 mt-1 text-sm">
			Role-gated data — general facts for all users, classified for admins.
		</p>
	</div>

	<div class="flex items-center gap-3">
		<button
			onclick={fetchFacts}
			disabled={loading}
			class="bg-primary rounded px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{loading ? 'Loading…' : 'Load Facts'}
		</button>
		{#if isAdmin}
			<span class="bg-warning-100 text-warning-800 rounded px-2 py-1 text-xs font-semibold">
				👑 Admin — you can see classified facts
			</span>
		{:else}
			<span class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
				🔑 Authenticated — general facts only
			</span>
		{/if}
	</div>

	{#if error}
		<p class="text-error-600 text-sm">{error}</p>
	{/if}

	{#if facts.length > 0}
		<div class="flex flex-col gap-3">
			{#each facts as item (item.id)}
				<div
					class="border-surface-z3 rounded-lg border p-4"
					class:bg-warning-50={item.tier === 'classified'}
					class:border-warning-300={item.tier === 'classified'}
				>
					<div class="mb-1 flex items-center gap-2">
						<span class="text-surface-z6 text-xs font-semibold uppercase">{item.category}</span>
						{#if item.tier === 'classified'}
							<span class="bg-warning-200 text-warning-800 rounded px-1.5 text-xs font-bold"
								>CLASSIFIED</span
							>
						{/if}
					</div>
					<p class="text-sm leading-relaxed">{item.fact}</p>
				</div>
			{/each}
		</div>
	{/if}

	<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
		<p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
		<code class="text-primary font-mono">{`{ path: '/data/facts', roles: '*' }`}</code>
		<p class="text-surface-z6 mt-1 text-xs">
			The API filters classified facts server-side based on role — no client-side filtering.
		</p>
	</div>
</div>
