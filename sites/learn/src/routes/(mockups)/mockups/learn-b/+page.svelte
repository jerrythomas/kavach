<script lang="ts">
	import { DOCS_NAV, DOCS_SECTIONS, POPULAR_DOCS } from '$lib/mockups/nav-data'
	import { Code, Button } from '@rokkit/ui'

	type Section = 'home' | 'docs' | 'demo' | 'api'
	let section = $state<Section>('home')
	let activePage = $state('/docs/quick-start')

	const topNav: { id: Section; label: string }[] = [
		{ id: 'home', label: 'Home' },
		{ id: 'docs', label: 'Docs' },
		{ id: 'demo', label: 'Demo' },
		{ id: 'api', label: 'API' }
	]

	// Filter nav items for current section
	const sidebarItems = $derived(section === 'docs' ? DOCS_NAV : [])
</script>

<!-- Top nav bar -->
<div class="border-surface-z3 bg-surface-z1 flex h-14 shrink-0 items-center gap-1 border-b px-8">
	<a href="/" class="mr-6 flex items-center gap-2">
		<img src="/brand/kavach.svg" alt="" class="h-6 w-6" />
		<span class="font-bold">Kavach</span>
	</a>
	{#each topNav as tab (tab.id)}
		<button
			onclick={() => {
				section = tab.id
				if (tab.id === 'docs') activePage = '/docs/quick-start'
			}}
			class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
			class:bg-surface-z2={section === tab.id}
			class:text-surface-z9={section === tab.id}
			class:text-surface-z6={section !== tab.id}
			class:hover:text-surface-z8={section !== tab.id}
		>
			{tab.label}
		</button>
	{/each}
	<div class="flex-1"></div>
	<a
		href="https://github.com/jerrythomas/kavach"
		class="border-surface-z4 bg-surface-z2 hover:bg-surface-z3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
	>
		<span class="i-app-code-visible h-3.5 w-3.5"></span>
		GitHub
	</a>
</div>

<!-- Content area -->
<div class="flex min-h-0 flex-1 overflow-hidden">
	{#if section === 'home'}
		<!-- Hub home -->
		<div class="flex-1 overflow-y-auto">
			<!-- Hero -->
			<div class="border-surface-z2 bg-surface-z1 border-b px-8 py-14 text-center">
				<h1 class="text-surface-z9 mb-3 text-5xl font-black tracking-tight">
					Drop-in auth for SvelteKit
				</h1>
				<p class="text-surface-z6 mx-auto mb-6 max-w-lg text-lg">
					One unified API, declarative route protection, and pre-built UI components — across every
					platform.
				</p>
				<div class="flex justify-center gap-3">
					<Button onclick={() => (section = 'docs')} variant="primary" size="lg">Get Started</Button
					>
					<a
						href="https://github.com/jerrythomas/kavach"
						class="border-surface-z4 bg-surface-z2 hover:bg-surface-z3 inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
					>
						View on GitHub
					</a>
				</div>
			</div>

			<!-- Category hub -->
			<div class="mx-auto max-w-4xl px-8 py-12">
				<h2 class="text-surface-z9 mb-6 text-xl font-bold">Browse the docs</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each DOCS_SECTIONS as s (s.href)}
						<button
							onclick={() => {
								section = 'docs'
								activePage = s.href
							}}
							class="border-surface-z3 bg-surface-z1 hover:border-primary flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
						>
							<span class="{s.icon} text-primary h-6 w-6"></span>
							<div>
								<p class="text-surface-z9 font-semibold">{s.label}</p>
								<p class="text-surface-z5 mt-0.5 text-xs">{s.desc}</p>
							</div>
						</button>
					{/each}
				</div>

				<!-- Quick install -->
				<div
					class="border-surface-z3 bg-surface-z1 mt-10 flex items-center gap-6 rounded-2xl border p-6"
				>
					<div class="flex-1">
						<p class="text-surface-z9 mb-1 font-semibold">Get started in seconds</p>
						<p class="text-surface-z6 text-sm">
							The CLI scaffolds everything — hooks, routes, config, and UI.
						</p>
					</div>
					<div
						class="border-surface-z3 bg-surface-z2 overflow-hidden rounded-xl border [&_pre]:!px-4 [&_pre]:!py-3"
					>
						<Code code="bunx @kavach/cli init" language="bash" />
					</div>
				</div>
			</div>
		</div>
	{:else if section === 'docs'}
		<!-- 2-column docs -->
		<aside class="border-surface-z3 bg-surface-z1 w-56 shrink-0 overflow-y-auto border-r py-6">
			{#each DOCS_NAV as item (item.value ?? item.label)}
				{#if item.children}
					<div class="mb-1 px-4">
						<p class="text-surface-z5 mt-4 mb-1 text-xs font-semibold tracking-widest uppercase">
							{item.label}
						</p>
						{#each item.children as child (child.value)}
							<button
								onclick={() => (activePage = child.value)}
								class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
								class:text-primary={activePage === child.value}
								class:font-medium={activePage === child.value}
								class:text-surface-z6={activePage !== child.value}
								class:hover:text-surface-z8={activePage !== child.value}
							>
								{#if child.icon}<span class="{child.icon} h-3.5 w-3.5 shrink-0"></span>{/if}
								{child.label}
							</button>
						{/each}
					</div>
				{:else}
					<div class="px-4">
						<button
							onclick={() => (activePage = item.value)}
							class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
							class:text-primary={activePage === item.value}
							class:font-medium={activePage === item.value}
							class:text-surface-z6={activePage !== item.value}
							class:hover:text-surface-z8={activePage !== item.value}
						>
							{#if item.icon}<span class="{item.icon} h-3.5 w-3.5 shrink-0"></span>{/if}
							{item.label}
						</button>
					</div>
				{/if}
			{/each}
		</aside>
		<main class="min-w-0 flex-1 overflow-y-auto px-10 py-10">
			<h1 class="text-surface-z9 mb-4 text-3xl font-black">Quick Start</h1>
			<p class="text-surface-z6 mb-6 text-base leading-relaxed">
				Get Kavach running in your SvelteKit app in under 5 minutes.
			</p>
			<div
				class="border-surface-z3 bg-surface-z2 mb-6 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
			>
				<Code code="bunx @kavach/cli init" language="bash" />
			</div>
			<p class="text-surface-z7 text-sm leading-relaxed">
				The CLI will detect your SvelteKit project, ask which adapter to use, and scaffold the auth
				layer — hooks, route config, environment types, and a pre-built login page.
			</p>
			<div class="border-surface-z3 mt-8 rounded-2xl border p-6">
				<p class="text-surface-z9 mb-3 text-sm font-semibold">Popular pages</p>
				<ul class="flex flex-col gap-1">
					{#each POPULAR_DOCS as p (p.href)}
						<li>
							<button
								onclick={() => (activePage = p.href)}
								class="text-primary text-sm hover:underline"
							>
								{p.label}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</main>
	{:else}
		<div class="flex flex-1 items-center justify-center">
			<div class="text-center">
				<p class="text-surface-z9 text-lg font-semibold">
					{section === 'demo' ? 'Demo' : 'API Reference'}
				</p>
				<p class="text-surface-z5 mt-2 text-sm">
					This section is represented in a separate mockup.
				</p>
				<Button onclick={() => (section = 'home')} variant="primary" class="mt-4"
					>Back to home</Button
				>
			</div>
		</div>
	{/if}
</div>
