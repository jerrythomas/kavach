<script>
	let entity = 'todos'
	let rows = []
	let error = null
	let loading = false

	async function fetchData() {
		loading = true
		error = null
		try {
			const res = await fetch(`/data/${entity}`)
			if (!res.ok) {
				const body = await res.json()
				error = body.error || `HTTP ${res.status}`
			} else {
				rows = await res.json()
			}
		} catch (e) {
			error = e.message
		}
		loading = false
	}
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-xl">CRUD Demo</h1>

	<div class="flex gap-2 items-center">
		<input
			type="text"
			bind:value={entity}
			placeholder="Entity name (e.g. todos)"
			class="border border-neutral-300 rounded px-3 py-2"
		/>
		<button
			onclick={fetchData}
			class="px-4 py-2 bg-primary-600 text-white rounded"
		>
			Fetch
		</button>
	</div>

	{#if loading}
		<p class="text-neutral-500">Loading...</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if rows.length > 0}
		<pre class="bg-neutral-100 p-4 rounded overflow-auto text-sm">{JSON.stringify(rows, null, 2)}</pre>
	{:else}
		<p class="text-neutral-400">No data. Enter an entity name and click Fetch.</p>
	{/if}
</div>
