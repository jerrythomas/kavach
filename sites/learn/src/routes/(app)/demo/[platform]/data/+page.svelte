<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	type Row = Record<string, unknown>
	let entity = $state('posts')
	let rows = $state<Row[]>([])
	let error = $state<string | null>(null)
	let loading = $state(false)

	async function fetchData() {
		loading = true
		error = null
		try {
			const res = await fetch(`/data/${entity}`)
			if (!res.ok) {
				const body = await res.json()
				error = body.error ?? `HTTP ${res.status}`
			} else {
				rows = await res.json()
			}
		} catch (e: any) {
			error = e.message
		}
		loading = false
	}
</script>

<div class="flex flex-col gap-4 p-8">
	<h1 class="text-2xl font-bold">Data Operations</h1>

	<div class="bg-info-100 border-info-300 rounded-lg border p-4">
		<p class="text-info-900">
			Demonstrates data fetching with role-based access control. Admin users can see admin-only
			records; others see only public records.
		</p>
	</div>

	<div class="flex items-center gap-2">
		<select
			bind:value={entity}
			class="border-surface-z3 bg-surface-z0 rounded border px-3 py-2 text-sm"
		>
			<option value="posts">posts</option>
			<option value="users">users</option>
		</select>
		<button
			onclick={fetchData}
			class="bg-primary rounded px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
		>
			Fetch
		</button>
	</div>

	{#if loading}
		<p class="text-surface-z6">Loading...</p>
	{:else if error}
		<p class="text-error-600">{error}</p>
	{:else if rows.length > 0}
		<div class="border-surface-z3 overflow-hidden rounded-lg border">
			<table class="w-full text-sm">
				<thead class="bg-surface-z1 border-surface-z3 border-b">
					<tr>
						{#each Object.keys(rows[0]) as col (col)}
							<th class="text-surface-z6 px-4 py-2 text-left text-xs font-semibold uppercase"
								>{col}</th
							>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row, i (i)}
						<tr
							class="border-surface-z2 hover:bg-surface-z1 border-b transition-colors last:border-0"
						>
							{#each Object.values(row) as val}
								<td class="text-surface-z8 px-4 py-2">{val}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if rows.length === 0 && !loading}
		<p class="text-surface-z6">Select an entity and click Fetch to load data.</p>
	{/if}
</div>
