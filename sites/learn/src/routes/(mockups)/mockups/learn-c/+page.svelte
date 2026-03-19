<script lang="ts">
	import { POPULAR_DOCS } from '$lib/mockups/nav-data'
	import CommandPalette from '$lib/mockups/CommandPalette.svelte'
	import { Code } from '@rokkit/ui'

	let paletteOpen = $state(false)
	let currentPage = $state<string | null>(null)

	function openPalette() {
		paletteOpen = true
	}
	function closePalette() {
		paletteOpen = false
	}
	function selectPage(href: string) {
		currentPage = href
		paletteOpen = false
	}

	// Global ⌘K handler
	function handleGlobalKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault()
			paletteOpen = true
		}
	}

	const tocItems = [
		'Prerequisites',
		'Installation',
		'Scaffold auth',
		'Configure routes',
		'Run your app'
	]
	let activeToc = $state('Prerequisites')
</script>

<svelte:window onkeydown={handleGlobalKey} />

<!-- Minimal top bar -->
<header
	class="border-surface-z3 bg-surface-z1/80 sticky top-0 z-10 flex h-12 items-center gap-4 border-b px-8 backdrop-blur"
>
	<a href="/" class="flex items-center gap-2">
		<img src="/brand/kavach.svg" alt="" class="h-5 w-5" />
		<span class="text-surface-z9 text-sm font-bold">Kavach</span>
	</a>
	<div class="flex-1"></div>
	<!-- ⌘K trigger -->
	<button
		onclick={openPalette}
		class="border-surface-z4 bg-surface-z2 text-surface-z5 hover:bg-surface-z3 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
	>
		<span class="i-app-code-visible h-3.5 w-3.5"></span>
		Search docs…
		<kbd class="border-surface-z4 rounded border px-1 font-mono text-xs">⌘K</kbd>
	</button>
	<a
		href="https://github.com/jerrythomas/kavach"
		class="text-surface-z6 hover:text-surface-z9 text-sm transition-colors">GitHub</a
	>
</header>

{#if !currentPage}
	<!-- Search-first home -->
	<div class="flex flex-col items-center px-8 py-24">
		<h1 class="text-surface-z9 mb-4 text-5xl font-black tracking-tight">Kavach Docs</h1>
		<p class="text-surface-z6 mb-10 text-lg">Authentication for SvelteKit, simplified.</p>

		<!-- Hero search -->
		<button
			onclick={openPalette}
			class="border-surface-z4 bg-surface-z2 hover:bg-surface-z3 mb-12 flex w-full max-w-md items-center gap-3 rounded-2xl border px-5 py-4 text-left shadow-sm transition-colors"
		>
			<span class="i-app-code-visible text-surface-z5 h-5 w-5"></span>
			<span class="text-surface-z5 flex-1 text-base">Search anything…</span>
			<kbd class="border-surface-z4 bg-surface-z1 rounded-lg border px-2 py-1 font-mono text-sm"
				>⌘K</kbd
			>
		</button>

		<!-- Popular -->
		<div class="w-full max-w-md">
			<p class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">
				Popular pages
			</p>
			<div class="flex flex-col gap-1">
				{#each POPULAR_DOCS as item (item.href)}
					<button
						onclick={() => selectPage(item.href)}
						class="border-surface-z3 hover:border-primary flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
					>
						<span class="i-app-list text-surface-z5 h-4 w-4"></span>
						<span class="text-surface-z8 text-sm">{item.label}</span>
						<span class="text-surface-z4 ml-auto text-xs">→</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Reading layout -->
	<div class="flex justify-center">
		<article class="relative max-w-2xl min-w-0 flex-1 px-8 py-10">
			<!-- Breadcrumb -->
			<nav class="text-surface-z5 mb-6 flex items-center gap-2 text-xs">
				<button onclick={() => (currentPage = null)} class="hover:text-primary">Docs</button>
				<span>›</span>
				<span>Quick Start</span>
			</nav>

			<h1 class="text-surface-z9 mb-3 text-4xl font-black">Quick Start</h1>
			<p class="text-surface-z6 mb-8 text-lg leading-relaxed">
				Get Kavach running in your SvelteKit app in under 5 minutes.
			</p>

			<h2 class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Installation</h2>
			<div
				class="border-surface-z3 bg-surface-z2 mb-6 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
			>
				<Code code="bunx @kavach/cli init" language="bash" />
			</div>
			<p class="text-surface-z7 mb-6 text-sm leading-relaxed">
				The CLI scaffolds hooks, route config, env types, and a login page for your chosen provider.
			</p>

			<h2 class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Configure routes</h2>
			<div
				class="border-surface-z3 bg-surface-z2 mb-6 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
			>
				<Code
					code={`export const rules = [
  { path: '/dashboard', roles: '*' },
  { path: '/admin',     roles: ['admin'] }
]`}
					language="typescript"
				/>
			</div>

			<!-- Pagination -->
			<div class="border-surface-z3 mt-12 flex gap-4 border-t pt-6">
				<div class="flex-1"></div>
				<button
					onclick={() => selectPage('/docs/core-concepts')}
					class="border-surface-z3 hover:border-primary flex flex-col items-end gap-0.5 rounded-xl border p-4 transition-colors"
				>
					<span class="text-surface-z5 text-xs">Next</span>
					<span class="text-surface-z8 text-sm font-medium">Core Concepts →</span>
				</button>
			</div>
		</article>

		<!-- Floating TOC -->
		<aside class="sticky top-12 hidden h-fit w-44 shrink-0 py-10 pr-4 xl:block">
			<p class="text-surface-z5 mb-3 text-xs font-semibold tracking-widest uppercase">
				On this page
			</p>
			{#each tocItems as item (item)}
				<button
					onclick={() => (activeToc = item)}
					class="block w-full rounded px-2 py-1 text-left text-xs transition-colors"
					class:text-primary={activeToc === item}
					class:text-surface-z6={activeToc !== item}>{item}</button
				>
			{/each}
		</aside>
	</div>
{/if}

<CommandPalette open={paletteOpen} onclose={closePalette} onselect={selectPage} />
