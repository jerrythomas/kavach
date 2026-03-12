<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { AuthProvider } from '@kavach/ui'
	import { getPlatform } from '$lib/demo/platforms'
	import { AUTH_MODES, ALL_MODES_TAB, getMode } from '$lib/demo/modes'

	const platformId = $derived($page.params.platform)
	const platform = $derived(getPlatform(platformId))

	let activeTab = $state('all')

	const tabs = $derived([
		ALL_MODES_TAB,
		...AUTH_MODES.filter((m) => platform?.modes.includes(m.id) ?? false)
	])

	const disabledTabs = $derived(
		AUTH_MODES.filter((m) => !(platform?.modes.includes(m.id) ?? false))
	)

	const activeMode = $derived(activeTab === 'all' ? null : getMode(activeTab))

	function onSuccess() {
		goto(`/demo/${platformId}/dashboard`)
	}

	function prefillTestCredentials() {
		const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]')
		const passwordInput = document.querySelector<HTMLInputElement>('input[type="password"]')
		if (emailInput) {
			emailInput.value = 'test@test.com'
			emailInput.dispatchEvent(new Event('input', { bubbles: true }))
		}
		if (passwordInput) {
			passwordInput.value = 'password123'
			passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
		}
	}
</script>

<div class="mx-auto max-w-5xl px-6 py-12 sm:px-8">
	<!-- Platform header -->
	<div class="mb-10 flex items-center gap-4">
		<a
			href="/demo"
			class="text-surface-z5 hover:text-primary flex items-center gap-1 transition-colors"
			title="All platforms"
		>
			<span class="i-app:list h-5 w-5" aria-hidden="true"></span>
			<span class="text-sm">All</span>
		</a>
		<span class="text-surface-z3">/</span>
		{#if platform}
			<div class="bg-surface-z2 flex h-12 w-12 items-center justify-center rounded-xl">
				<span class="{platform.icon} h-8 w-8 text-3xl" aria-hidden="true"></span>
			</div>
			<div>
				<h1 class="text-surface-z9 text-2xl font-black sm:text-3xl">{platform.name}</h1>
				<p class="text-surface-z6 text-sm">{platform.description}</p>
			</div>
		{:else}
			<h1 class="text-surface-z9 text-2xl font-black">Unknown platform</h1>
		{/if}
	</div>

	<!-- Tab bar -->
	<div class="border-surface-z3 mb-8 flex flex-wrap gap-1 border-b pb-1">
		{#each tabs as tab (tab.id)}
			<button
				onclick={() => (activeTab = tab.id)}
				class="rounded-t-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id
					? 'bg-primary text-white'
					: 'text-surface-z6 hover:text-primary'}"
			>
				{tab.label}
			</button>
		{/each}
		{#each disabledTabs as tab (tab.id)}
			<button
				disabled
				title="Not supported by this adapter"
				class="cursor-not-allowed rounded-t-lg px-4 py-2 text-sm font-medium opacity-35"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Two-column content — stacked on mobile, side-by-side on lg -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Left: mode explainer -->
		<div class="flex flex-col gap-6">
			{#if activeMode}
				<div>
					<h2 class="text-surface-z9 mb-2 text-xl font-bold">{activeMode.label} Auth</h2>
					<p class="text-surface-z6 text-sm">{activeMode.description}</p>
				</div>

				<div>
					<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-wider uppercase">
						How Kavach wires it
					</h3>
					<ol class="flex flex-col gap-2">
						{#each activeMode.howItWorks as step, i}
							<li class="flex gap-3 text-sm">
								<span
									class="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
								>
									{i + 1}
								</span>
								<span class="text-surface-z7">{step}</span>
							</li>
						{/each}
					</ol>
				</div>

				<div>
					<h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-wider uppercase">
						Capabilities
					</h3>
					<ul class="flex flex-col gap-2">
						{#each activeMode.capabilities as cap}
							<li class="flex items-center gap-3 text-sm">
								<span
									class="h-4 w-4 shrink-0 {cap.kavachHandles
										? 'i-app:shield text-success-600'
										: 'i-app:shield text-surface-z4'}"
									aria-hidden="true"
								></span>
								<span
									class={cap.kavachHandles ? 'text-surface-z8' : 'text-surface-z5 line-through'}
								>
									{cap.label}
								</span>
								<span class="text-surface-z4 ml-auto shrink-0 text-xs">
									{cap.kavachHandles ? 'Kavach ✓' : 'Adapter'}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<!-- All tab -->
				<div>
					<h2 class="text-surface-z9 mb-2 text-xl font-bold">
						What {platform?.name ?? platformId} supports
					</h2>
					<p class="text-surface-z6 mb-6 text-sm">
						Select a tab to explore each auth mode individually, or use All to try all available
						providers at once.
					</p>
					<ul class="flex flex-col gap-3">
						{#each tabs.filter((t) => t.id !== 'all') as tab}
							<li
								class="border-surface-z2 bg-surface-z1 flex items-center gap-3 rounded-xl border p-3 text-sm"
							>
								<span class="i-app:shield text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
								<div>
									<span class="text-surface-z8 font-semibold">{tab.label}</span>
									{#if 'description' in tab}
										<p class="text-surface-z5 text-xs">{tab.description}</p>
									{/if}
								</div>
								<button
									onclick={() => (activeTab = tab.id)}
									class="text-primary ml-auto text-xs hover:underline"
								>
									Explore →
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<!-- Right: live auth form -->
		<div class="bg-surface-z1 border-surface-z3 flex flex-col gap-4 rounded-2xl border p-6">
			<div class="flex items-center justify-between">
				<h3 class="text-surface-z8 font-semibold">Sign in to try it</h3>
				{#if platform?.live}
					<span
						class="bg-success-100 text-success-700 rounded-full px-2.5 py-0.5 text-xs font-semibold"
						>LIVE</span
					>
				{:else}
					<span
						class="bg-surface-z3 text-surface-z5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
						>MOCK</span
					>
				{/if}
			</div>

			<AuthProvider name="email" mode="password" label="Sign in with Email" onsuccess={onSuccess} />

			<div class="text-surface-z5 flex items-center justify-center gap-2 text-xs">
				<button onclick={prefillTestCredentials} class="text-primary hover:underline">
					Use test credentials
				</button>
				<span class="text-surface-z3">·</span>
				<span class="font-mono">test@test.com / password123</span>
			</div>
		</div>
	</div>
</div>
