<script>
	import { goto } from '$app/navigation'
	import { AuthProvider } from '@kavach/ui'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { providers } from '$kavach/providers'
	import { env } from '$env/dynamic/public'

	const adapter = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapterLabel =
		{ supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapter] ?? adapter

	function onSuccess() {
		goto('/dashboard')
	}
</script>

<div class="bg-surface-z0 flex min-h-screen flex-col">
	<div class="fixed top-4 right-4 z-10">
		<ThemeSwitcherToggle />
	</div>

	<div class="flex flex-1 flex-col items-center justify-center px-6 py-16">
		<div class="w-full max-w-sm">
			<div class="mb-8 text-center">
				<a
					href="/"
					class="text-surface-z5 hover:text-primary mb-6 inline-block text-sm transition-colors"
				>
					← Back
				</a>
				<h1 class="text-surface-z9 text-2xl font-black">Sign in</h1>
				<p class="text-surface-z6 mt-1 text-sm">{adapterLabel} · Kavach Demo</p>
			</div>

			<div class="bg-surface-z1 border-surface-z3 flex flex-col gap-4 rounded-2xl border p-6">
				{#each providers as p (p.name)}
					<AuthProvider
						name={p.name}
						mode={p.mode ?? 'oauth'}
						onsuccess={onSuccess}
						label={p.label}
					/>
				{/each}
			</div>

			<p class="text-surface-z5 mt-4 text-center text-xs">
				Test credentials: <span class="font-mono">test@test.com / password123</span>
			</p>
		</div>
	</div>
</div>
