<script lang="ts">
	import type { PageData } from './$types'
	import { hackerMode } from '$lib/demo/hacker.svelte'
	import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'

	let { data }: { data: PageData } = $props()

	interface Fact {
		id: number
		tier: 'general' | 'classified'
		category: string
		fact: string
	}

	const isAdmin = $derived((data as any).user?.role === 'admin')

	let facts = $state<Fact[]>([])
	let error = $state<string | null>(null)
	let loading = $state(false)
	let writeError = $state<string | null>(null)
	let newFact = $state('')
	let newCategory = $state('')
	let newTier = $state<'general' | 'classified'>('general')
	let submitting = $state(false)
	let loadingAdminStats = $state(false)
	let adminStatsResult = $state<any>(null)

	async function tryAdminStats() {
		loadingAdminStats = true
		adminStatsResult = null
		try {
			const res = await fetch('/data/admin-stats')
			const body = await res.json()
			adminStatsResult = { status: res.status, statusText: res.statusText, body }
		} catch (e: any) {
			adminStatsResult = { error: e.message }
		}
		loadingAdminStats = false
	}

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
		} catch (e: any) {
			error = e.message
		}
		loading = false
	}

	async function addFact() {
		if (!newFact.trim()) return
		submitting = true
		writeError = null
		try {
			const res = await fetch('/data/facts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fact: newFact, category: newCategory || 'Custom', tier: newTier })
			})
			const body = await res.json()
			if (!res.ok) {
				writeError = body.error ?? `HTTP ${res.status}`
			} else {
				newFact = ''
				newCategory = ''
				await fetchFacts()
			}
		} catch (e: any) {
			writeError = e.message
		}
		submitting = false
	}

	async function deleteFact(id: number) {
		writeError = null
		try {
			const res = await fetch(`/data/facts?id=${id}`, { method: 'DELETE' })
			const body = await res.json()
			if (!res.ok) {
				writeError = body.error ?? `HTTP ${res.status}`
			} else {
				await fetchFacts()
			}
		} catch (e: any) {
			writeError = e.message
		}
	}
</script>

<div class="flex flex-col gap-6 p-8">
	<div>
		<h1 class="text-2xl font-bold">Space Facts</h1>
		<p class="text-surface-z7 mt-1 text-sm">
			Role-gated astronomy data — general facts for all users, classified briefings for admins.
		</p>
	</div>

	<SentryAnnotation
		title="Data filtered by role server-side"
		body="The /data/facts endpoint returns all rows for admin (including classified), and general-only rows for authenticated users. PostgREST row-level security enforces this — no client-side filtering."
		rule="roles: *"
	/>

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
				👑 Admin — you can see classified facts and write
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
					class="border-surface-z3 flex items-start justify-between gap-4 rounded-lg border p-4"
					class:bg-warning-50={item.tier === 'classified'}
					class:border-warning-300={item.tier === 'classified'}
				>
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-2">
							<span class="text-surface-z6 text-xs font-semibold uppercase">{item.category}</span>
							{#if item.tier === 'classified'}
								<span class="bg-warning-200 text-warning-800 rounded px-1.5 text-xs font-bold"
									>CLASSIFIED</span
								>
							{/if}
						</div>
						<p class="text-sm leading-relaxed">{item.fact}</p>
					</div>

					{#if isAdmin && item.id >= 100}
						<button
							onclick={() => deleteFact(item.id)}
							class="text-error-600 hover:text-error-800 shrink-0 text-xs transition-colors"
							title="Delete fact"
						>
							Delete
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if isAdmin}
		<div class="border-surface-z3 rounded-lg border p-4">
			<h2 class="mb-3 text-sm font-semibold">Add New Fact</h2>

			{#if writeError}
				<p class="text-error-600 mb-2 text-sm">{writeError}</p>
			{/if}

			<div class="flex flex-col gap-2">
				<textarea
					bind:value={newFact}
					placeholder="Enter a space fact…"
					rows="2"
					class="border-surface-z3 bg-surface-z0 w-full rounded border px-3 py-2 text-sm"
				></textarea>
				<div class="flex gap-2">
					<input
						bind:value={newCategory}
						placeholder="Category (optional)"
						class="border-surface-z3 bg-surface-z0 flex-1 rounded border px-3 py-2 text-sm"
					/>
					<select
						bind:value={newTier}
						class="border-surface-z3 bg-surface-z0 rounded border px-3 py-2 text-sm"
					>
						<option value="general">General</option>
						<option value="classified">Classified</option>
					</select>
					<button
						onclick={addFact}
						disabled={submitting || !newFact.trim()}
						class="bg-primary rounded px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{submitting ? 'Adding…' : 'Add'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if !isAdmin && writeError}
		<div class="border-error-300 bg-error-50 rounded-lg border p-4">
			<p class="text-error-800 text-sm font-medium">403 Forbidden</p>
			<p class="text-error-700 text-sm">{writeError}</p>
		</div>
	{/if}

	{#if hackerMode.value}
		<div class="border-warning-300 bg-warning-50 rounded-xl border p-4">
			<p class="text-warning-800 mb-3 text-sm font-semibold">
				💀 Hacker Mode — Test /data/admin-stats
			</p>
			<p class="text-warning-700 mb-3 text-xs">
				This endpoint requires admin role. Kavach will return 403 for non-admin users, even if you
				call it directly.
			</p>
			<button
				onclick={tryAdminStats}
				disabled={loadingAdminStats}
				class="bg-warning-600 hover:bg-warning-700 rounded px-3 py-1.5 text-xs text-white transition-colors disabled:opacity-50"
			>
				{loadingAdminStats ? 'Trying…' : 'Try /data/admin-stats'}
			</button>
			{#if adminStatsResult}
				<pre
					class="border-warning-300 mt-3 overflow-auto rounded-lg border bg-black/10 p-3 font-mono text-xs"
				>{JSON.stringify(adminStatsResult, null, 2)}</pre>
			{/if}
		</div>
	{/if}
</div>
