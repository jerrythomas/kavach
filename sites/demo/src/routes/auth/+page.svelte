<script>
	import { goto } from '$app/navigation'
	import { getContext } from 'svelte'
	import { AuthProvider } from '@kavach/ui'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import DensitySwitcherToggle from '$lib/components/DensitySwitcherToggle.svelte'
	import { providers } from '$kavach/providers'
	import { env } from '$env/dynamic/public'
	import { ADAPTERS, ROUTES, COPY } from 'showcase-kavach'

	const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapter = ADAPTERS[adapterId] ?? { label: adapterId }

	// Set by the root layout once the browser kavach instance is hydrated. Until
	// then signIn would throw on an uninitialized instance, so keep the provider
	// buttons behind this gate.
	const kavachReady = getContext('kavach-ready')

	function onSuccess() {
		goto(ROUTES.home)
	}
</script>

<div class="bg-paper flex min-h-screen flex-col">
	<div class="fixed top-4 right-4 z-10 flex items-center gap-2">
		<ThemeSwitcherToggle />
		<DensitySwitcherToggle />
	</div>

	<div class="px-gutter py-section flex flex-1 flex-col items-center justify-center">
		<div class="w-full max-w-sm">
			<div class="mb-8 text-center">
				<a
					href="/"
					class="text-ink-soft hover:text-primary mb-6 inline-block text-sm transition-colors"
				>
					{COPY.signIn.back}
				</a>
				<h1 class="text-ink text-2xl font-black">{COPY.signIn.title}</h1>
				<p class="text-ink-mute mt-1 text-sm">
					{COPY.signIn.subtitle.replace('{adapter}', adapter.label)}
				</p>
			</div>

			<div class="bg-paper-soft border-paper-edge gap-card p-card flex flex-col rounded-2xl border">
				{#if kavachReady?.value}
					{#each providers as p (p.name)}
						<AuthProvider
							name={p.name}
							mode={p.mode ?? 'oauth'}
							onsuccess={onSuccess}
							label={p.label}
						/>
					{/each}
				{:else}
					<p class="text-ink-mute py-4 text-center text-sm" data-auth-loading>Loading sign-in…</p>
				{/if}
			</div>

			<p class="text-ink-soft mt-4 text-center text-xs">
				{COPY.signIn.testCredentials}
			</p>
		</div>
	</div>
</div>
