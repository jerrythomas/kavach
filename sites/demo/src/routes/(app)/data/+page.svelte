<script>
	import { COPY } from 'showcase-kavach'

	let { data } = $props()
	const isAdmin = $derived(data?.user?.role === 'admin')

	/** @type {Array<{ id: number; tier: 'general' | 'classified'; category: string; fact: string }>} */
	let facts = $state([])
	/** @type {string | null} */
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
			error = e instanceof Error ? e.message : String(e)
		}
		loading = false
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-ink text-2xl font-bold">{COPY.demo.data.title}</h1>
		<p class="text-ink-mute mt-1 text-sm">
			{COPY.demo.data.subtitle}
		</p>
	</div>

	<div class="flex items-center gap-3">
		<button
			onclick={fetchFacts}
			disabled={loading}
			class="bg-primary text-on-primary rounded px-4 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{loading ? COPY.demo.data.loading : COPY.demo.data.load}
		</button>
		{#if isAdmin}
			<span class="bg-warning-soft text-warning rounded px-2 py-1 text-xs font-semibold">
				{COPY.demo.data.adminBadge}
			</span>
		{:else}
			<span class="bg-info-soft text-info rounded px-2 py-1 text-xs font-semibold">
				{COPY.demo.data.userBadge}
			</span>
		{/if}
	</div>

	{#if error}
		<p class="text-danger text-sm">{error}</p>
	{/if}

	{#if facts.length > 0}
		<div class="flex flex-col gap-3">
			{#each facts as item (item.id)}
				<div
					class="border-paper-edge rounded-lg border p-4"
					class:bg-warning-soft={item.tier === 'classified'}
					class:border-warning={item.tier === 'classified'}
				>
					<div class="mb-1 flex items-center gap-2">
						<span class="text-ink-mute text-xs font-semibold uppercase">{item.category}</span>
						{#if item.tier === 'classified'}
							<span class="bg-warning text-ink rounded px-1.5 text-xs font-bold"
								>{COPY.demo.data.classified}</span
							>
						{/if}
					</div>
					<p class="text-sm leading-relaxed">{item.fact}</p>
				</div>
			{/each}
		</div>
	{/if}

	<div class="border-paper-edge bg-paper-soft rounded-xl border p-4 text-sm">
		<p class="text-ink-soft mb-1 text-xs font-semibold tracking-wider uppercase">
			{COPY.demo.data.ruleLabel}
		</p>
		<code class="text-primary font-mono">{`{ path: '/data/facts', roles: '*' }`}</code>
		<p class="text-ink-mute mt-1 text-xs">
			{COPY.demo.data.ruleNote}
		</p>
	</div>
</div>
