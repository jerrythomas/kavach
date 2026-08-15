<script>
	import { goto } from '$app/navigation'
	import { AuthProvider } from '@kavach/ui'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { providers } from '$kavach/providers'
	import { env } from '$env/dynamic/public'
	import { ADAPTERS, ROUTES, COPY } from 'showcase-kavach'

	const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapter = ADAPTERS[adapterId] ?? { label: adapterId }

	function onSuccess() {
		goto(ROUTES.home)
	}
</script>

<div class="bg-paper flex min-h-screen flex-col">
	<div class="fixed top-4 right-4 z-10">
		<ThemeSwitcherToggle />
	</div>

	<div class="flex flex-1 flex-col items-center justify-center px-6 py-16">
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

			<div class="bg-paper-soft border-paper-edge flex flex-col gap-4 rounded-2xl border p-6">
				{#each providers as p (p.name)}
					<AuthProvider
						name={p.name}
						mode={p.mode ?? 'oauth'}
						onsuccess={onSuccess}
						label={p.label}
					/>
				{/each}
			</div>

			<p class="text-ink-soft mt-4 text-center text-xs">
				{COPY.signIn.testCredentials}
			</p>
		</div>
	</div>
</div>
