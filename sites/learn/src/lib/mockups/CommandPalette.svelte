<script lang="ts">
	import { DOCS_NAV, POPULAR_DOCS } from '$lib/mockups/nav-data'

	interface Props {
		open: boolean
		onclose: () => void
		onselect: (href: string) => void
	}
	let { open, onclose, onselect }: Props = $props()

	let query = $state('')
	let selectedIndex = $state(0)

	// Flatten all nav items for search
	const allItems = [
		...POPULAR_DOCS,
		...DOCS_NAV.flatMap((n) =>
			n.children
				? n.children.map((c) => ({ label: c.label, href: c.value }))
				: [{ label: n.label, href: n.value }]
		)
	]

	const results = $derived(
		query.trim().length === 0
			? POPULAR_DOCS
			: allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
	)

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose()
			return
		}
		if (e.key === 'ArrowDown') {
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1)
			e.preventDefault()
		}
		if (e.key === 'ArrowUp') {
			selectedIndex = Math.max(selectedIndex - 1, 0)
			e.preventDefault()
		}
		if (e.key === 'Enter' && results[selectedIndex]) {
			onselect(results[selectedIndex].href)
		}
	}

	$effect(() => {
		if (open) {
			selectedIndex = 0
			query = ''
		}
	})
</script>

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={onclose}
		aria-label="Close"
	></button>

	<!-- Palette -->
	<div
		class="border-surface-z4 bg-surface-z1 fixed top-24 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl"
	>
		<!-- Input -->
		<div class="border-surface-z3 flex items-center gap-3 border-b px-4 py-3">
			<span class="i-app-code-visible text-surface-z5 h-4 w-4 shrink-0"></span>
			<input
				class="text-surface-z9 placeholder:text-surface-z4 flex-1 bg-transparent text-sm outline-none"
				placeholder="Search docs…"
				bind:value={query}
				onkeydown={handleKey}
				autofocus
			/>
			<kbd class="border-surface-z4 text-surface-z5 rounded border px-1.5 py-0.5 font-mono text-xs"
				>Esc</kbd
			>
		</div>

		<!-- Results -->
		<div class="max-h-72 overflow-y-auto p-2">
			{#if results.length === 0}
				<p class="text-surface-z5 px-3 py-6 text-center text-sm">No results for "{query}"</p>
			{:else}
				{#if query.trim().length === 0}
					<p class="text-surface-z5 mb-1 px-3 py-1 text-xs font-semibold">Popular</p>
				{/if}
				{#each results as item, i (item.href)}
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
						class:bg-primary={i === selectedIndex}
						class:text-on-primary={i === selectedIndex}
						class:text-surface-z8={i !== selectedIndex}
						class:hover:bg-surface-z2={i !== selectedIndex}
						onmouseenter={() => (selectedIndex = i)}
						onclick={() => onselect(item.href)}
					>
						<span class="i-app-list h-3.5 w-3.5 shrink-0"></span>
						{item.label}
					</button>
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		<div class="border-surface-z3 flex gap-4 border-t px-4 py-2">
			{#each [['↑↓', 'navigate'], ['↵', 'select'], ['Esc', 'close']] as [key, desc] (key)}
				<span class="text-surface-z5 flex items-center gap-1 text-xs">
					<kbd class="border-surface-z4 rounded border px-1 font-mono text-xs">{key}</kbd>
					{desc}
				</span>
			{/each}
		</div>
	</div>
{/if}
