<script>
	import { Code } from '@rokkit/ui'
	import { PLATFORMS } from '$lib/demo/platforms'
</script>

<div class="max-w-4xl space-y-12">
	<!-- Hero -->
	<div>
		<h1 class="text-surface-z9 mb-3 text-3xl font-extrabold tracking-tight">
			Kavach Documentation
		</h1>
		<p class="text-surface-z6 max-w-2xl text-base leading-relaxed">
			Drop-in authentication for SvelteKit — one unified API across all platforms, declarative route
			protection, and pre-built UI components.
		</p>
	</div>

	<!-- Get started -->
	<section>
		<p class="text-surface-z5 mb-4 text-xs font-semibold tracking-wider uppercase">Get started</p>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<a
				href="/docs/quick-start"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
			>
				<span class="i-app-login text-primary h-5 w-5"></span>
				<span class="text-surface-z8 text-sm font-semibold">Quick Start</span>
				<span class="text-surface-z5 text-xs">Up and running in 5 min</span>
			</a>
			<a
				href="/docs/configuration"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
			>
				<span class="i-app-list text-primary h-5 w-5"></span>
				<span class="text-surface-z8 text-sm font-semibold">Configuration</span>
				<span class="text-surface-z5 text-xs">kavach.config.js reference</span>
			</a>
			<a
				href="/docs/adapters"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
			>
				<span class="i-app-shield text-primary h-5 w-5"></span>
				<span class="text-surface-z8 text-sm font-semibold">Adapters</span>
				<span class="text-surface-z5 text-xs">Pick your auth platform</span>
			</a>
			<a
				href="/docs/cli"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
			>
				<span class="i-app-code-visible text-primary h-5 w-5"></span>
				<span class="text-surface-z8 text-sm font-semibold">CLI</span>
				<span class="text-surface-z5 text-xs">kavach init, doctor, generate</span>
			</a>
		</div>
	</section>

	<!-- Adapter grid -->
	<section>
		<p class="text-surface-z5 mb-4 text-xs font-semibold tracking-wider uppercase">
			Choose an adapter
		</p>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#each PLATFORMS as platform (platform.id)}
				<a
					href="/docs/adapters/{platform.id}"
					class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
				>
					<!-- Icon + badge -->
					<div class="flex items-start justify-between">
						<div
							class="flex h-11 w-11 items-center justify-center rounded-xl {platform.iconFallback} bg-opacity-10"
						>
							<span class="{platform.icon} h-7 w-7" aria-hidden="true"></span>
						</div>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
								? 'bg-success-100 text-success-700'
								: 'bg-surface-z3 text-surface-z5'}"
						>
							{platform.live ? 'LIVE' : 'WIP'}
						</span>
					</div>

					<!-- Name + description -->
					<div>
						<p class="text-surface-z9 group-hover:text-primary mb-0.5 font-bold transition-colors">
							{platform.name}
						</p>
						<p class="text-surface-z5 text-xs leading-relaxed">{platform.description}</p>
					</div>

					<!-- Capability pills -->
					<div class="flex flex-wrap gap-1.5">
						{#each platform.capabilities.slice(0, 3) as cap}
							<span class="bg-surface-z2 text-surface-z5 rounded-full px-2 py-0.5 text-xs"
								>{cap}</span
							>
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- What Kavach provides -->
	<section>
		<p class="text-surface-z5 mb-4 text-xs font-semibold tracking-wider uppercase">
			What Kavach provides
		</p>
		<div class="grid grid-cols-2 gap-3">
			<div class="border-surface-z3 bg-surface-z1 flex items-start gap-3 rounded-xl border p-4">
				<span class="i-app-shield text-primary mt-0.5 h-5 w-5 shrink-0"></span>
				<div>
					<p class="text-surface-z8 mb-1 text-sm font-semibold">Role-based route protection</p>
					<p class="text-surface-z5 text-xs">
						Declare rules once in config — no scattered auth checks
					</p>
				</div>
			</div>
			<div class="border-surface-z3 bg-surface-z1 flex items-start gap-3 rounded-xl border p-4">
				<span class="i-app-login text-primary mt-0.5 h-5 w-5 shrink-0"></span>
				<div>
					<p class="text-surface-z8 mb-1 text-sm font-semibold">Server-side session cookies</p>
					<p class="text-surface-z5 text-xs">
						Secure httpOnly cookies, no client-side token exposure
					</p>
				</div>
			</div>
			<div class="border-surface-z3 bg-surface-z1 flex items-start gap-3 rounded-xl border p-4">
				<span class="i-app-list text-primary mt-0.5 h-5 w-5 shrink-0"></span>
				<div>
					<p class="text-surface-z8 mb-1 text-sm font-semibold">Platform agnostic API</p>
					<p class="text-surface-z5 text-xs">Swap adapters without touching your app code</p>
				</div>
			</div>
			<div class="border-surface-z3 bg-surface-z1 flex items-start gap-3 rounded-xl border p-4">
				<span class="i-app-code-visible text-primary mt-0.5 h-5 w-5 shrink-0"></span>
				<div>
					<p class="text-surface-z8 mb-1 text-sm font-semibold">Pre-built UI components</p>
					<p class="text-surface-z5 text-xs">AuthPage, AuthProvider, login flows ready to use</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Installation -->
	<section>
		<p class="text-surface-z5 mb-4 text-xs font-semibold tracking-wider uppercase">Installation</p>
		<Code code={`npm install kavach @kavach/sentry @kavach/ui`} language="bash" />
	</section>
</div>
