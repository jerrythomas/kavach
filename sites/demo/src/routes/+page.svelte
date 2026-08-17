<script>
	import { env } from '$env/dynamic/public'
	import { ADAPTERS, ROUTES } from 'showcase-kavach'

	const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapterLabel = ADAPTERS[adapterId]?.label ?? adapterId

	let { data } = $props()
	const user = $derived(data?.user ?? null)
</script>

<div class="bg-paper flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
	<div class="max-w-lg">
		<p class="text-primary mb-3 text-sm font-semibold tracking-wider uppercase">Kavach Demo</p>
		<h1 class="text-ink mb-4 text-4xl font-black">
			{adapterLabel} Authentication
		</h1>
		<p class="text-ink-mute mb-8 text-lg">
			Role-based route protection, session management, and auth flows — powered by Kavach.
		</p>
		{#if user}
			<a
				href={ROUTES.home}
				class="bg-primary text-on-primary inline-block rounded-xl px-8 py-3 font-semibold transition-opacity hover:opacity-90"
			>
				Go to dashboard →
			</a>
		{:else}
			<a
				href="/auth"
				class="bg-primary text-on-primary inline-block rounded-xl px-8 py-3 font-semibold transition-opacity hover:opacity-90"
			>
				Sign in to try it →
			</a>
		{/if}
	</div>
</div>
