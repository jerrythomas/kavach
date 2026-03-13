<script>
	import { env } from '$env/dynamic/public'

	const adapter = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapterLabel =
		{ supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapter] ?? adapter
</script>

<div
	class="bg-surface-z0 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
>
	<div class="max-w-lg">
		<p class="text-primary mb-3 text-sm font-semibold tracking-wider uppercase">Kavach Demo</p>
		<h1 class="text-surface-z9 mb-4 text-4xl font-black">
			{adapterLabel} Authentication
		</h1>
		<p class="text-surface-z6 mb-8 text-lg">
			Role-based route protection, session management, and auth flows — powered by Kavach.
		</p>
		<a
			href="/auth"
			class="bg-primary inline-block rounded-xl px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
		>
			Sign in to try it →
		</a>
	</div>
</div>
