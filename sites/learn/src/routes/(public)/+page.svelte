<script>
	import { Button, Code } from '@rokkit/ui'
	import { PLATFORMS } from '$lib/demo/platforms'

	const features = [
		{ icon: 'i-app-shield', label: 'Role-based route protection' },
		{ icon: 'i-app-login', label: 'Server-side session cookie' },
		{ icon: 'i-app-list', label: 'Cached login history' },
		{ icon: 'i-app-code-visible', label: 'Pre-built UI components' }
	]
</script>

<main class="text-surface-z9 flex flex-col items-center px-8 py-16">
	<!-- Hero -->
	<div class="mx-auto mb-16 max-w-2xl space-y-6 text-center">
		<h1
			class="text-surface-z9 flex w-full items-center justify-center gap-3 text-5xl font-black tracking-tight"
		>
			<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-14 w-14" />
			Kavach
		</h1>
		<p class="text-surface-z6 mx-auto max-w-lg text-lg">
			Drop-in authentication for SvelteKit. One unified API, declarative route protection, and
			pre-built UI components — across every platform.
		</p>
		<div class="flex justify-center gap-3 pt-2">
			<Button href="/docs/quick-start" variant="primary" size="lg">Get Started</Button>
			<Button href="https://github.com/jerrythomas/kavach" style="outline" size="lg">GitHub</Button>
		</div>

		<div class="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
			<!-- Platforms card -->
			<div
				class="border-surface-z3 bg-surface-z1 flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm"
			>
				<p class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Works with</p>
				<div class="flex flex-wrap items-center gap-3">
					{#each PLATFORMS as platform (platform.id)}
						<a
							href="/docs/adapters/{platform.id}"
							title={platform.name}
							class="border-surface-z3 bg-surface-z2 hover:border-primary flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
						>
							<span class="{platform.icon} h-6 w-6" aria-hidden="true"></span>
						</a>
					{/each}
				</div>
				<p class="text-surface-z5 text-xs">{PLATFORMS.map((p) => p.name).join(' · ')}</p>
			</div>
			<!-- Quick start card -->
			<div
				class="border-surface-z3 bg-surface-z1 flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm"
			>
				<p class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Quick start</p>
				<div
					class="border-surface-z2 bg-surface-z2 overflow-hidden rounded-md border [&_pre]:!py-2"
				>
					<Code code="bunx @kavach/cli init" language="bash" />
				</div>
				<p class="text-surface-z5 text-xs">Scaffold auth into any SvelteKit app in seconds</p>
			</div>
		</div>
	</div>

	<!-- What Kavach provides -->
	<div class="border-primary/20 bg-primary/5 mb-12 w-full max-w-4xl rounded-2xl border px-6 py-5">
		<p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
			What Kavach provides with any platform
		</p>
		<div class="flex flex-wrap gap-5">
			{#each features as feature (feature.icon)}
				<div class="flex items-center gap-2 text-sm">
					<span class="{feature.icon} text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
					<span class="text-surface-z8">{feature.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Adapter grid -->
	<div class="w-full max-w-4xl">
		<p class="text-surface-z5 mb-5 text-xs font-semibold tracking-wider uppercase">
			Choose your platform
		</p>
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each PLATFORMS as platform (platform.id)}
				<a
					href="/docs/adapters/{platform.id}"
					class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
				>
					<div class="flex items-start justify-between">
						<div class="bg-surface-z2 flex h-14 w-14 items-center justify-center rounded-xl">
							<span class="{platform.icon} h-9 w-9" aria-hidden="true"></span>
						</div>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
								? 'bg-success-100 text-success-700'
								: 'bg-surface-z3 text-surface-z5'}"
						>
							{platform.live ? 'LIVE' : 'WIP'}
						</span>
					</div>

					<div>
						<h2
							class="text-surface-z9 group-hover:text-primary mb-0.5 text-lg font-bold transition-colors"
						>
							{platform.name}
						</h2>
						<p class="text-surface-z6 text-sm">{platform.description}</p>
					</div>

					<ul class="flex flex-col gap-1.5">
						{#each platform.capabilities as cap}
							<li class="flex items-center gap-2 text-sm">
								<span class="i-app-shield text-primary/40 h-3 w-3 shrink-0" aria-hidden="true"
								></span>
								<span class="text-surface-z6">{cap}</span>
							</li>
						{/each}
					</ul>
				</a>
			{/each}
		</div>
	</div>
</main>
