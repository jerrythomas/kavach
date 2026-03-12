<script lang="ts">
	import { PLATFORMS, KAVACH_FEATURES } from '$lib/demo/platforms'
</script>

<div class="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 sm:px-8">
	<!-- Hero -->
	<div class="mb-10 text-center">
		<h1 class="text-surface-z9 mb-3 text-4xl font-black tracking-tight sm:text-5xl">Kavach Demo</h1>
		<p class="text-surface-z6 mx-auto max-w-md text-base sm:text-lg">
			Learn authentication by doing. Pick a platform, sign in, explore, hit the walls.
		</p>
	</div>

	<!-- Kavach features — shown once, apply to every platform -->
	<div class="border-primary/20 bg-primary/5 mb-10 w-full rounded-2xl border px-6 py-5">
		<p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
			What Kavach provides with any platform
		</p>
		<div class="flex flex-wrap gap-4">
			{#each KAVACH_FEATURES as feature}
				<div class="flex items-center gap-2 text-sm">
					<span class="i-app-shield text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
					<span class="text-surface-z8">{feature}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Platform grid -->
	<div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each PLATFORMS as platform (platform.id)}
			<a
				href="/demo/{platform.id}"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			>
				<!-- Icon + badge row -->
				<div class="flex items-start justify-between">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl {platform.iconFallback} bg-opacity-10"
					>
						<span class="{platform.icon} h-9 w-9 text-3xl" aria-hidden="true"></span>
					</div>
					<span
						class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
							? 'bg-success-100 text-success-700'
							: 'bg-surface-z3 text-surface-z5'}"
					>
						{platform.live ? 'LIVE' : 'SIMULATED'}
					</span>
				</div>

				<!-- Name + description -->
				<div>
					<h2
						class="text-surface-z9 group-hover:text-primary mb-0.5 text-lg font-bold transition-colors"
					>
						{platform.name}
					</h2>
					<p class="text-surface-z6 text-sm">{platform.description}</p>
				</div>

				<!-- Platform capabilities -->
				<ul class="flex flex-col gap-1">
					{#each platform.capabilities as cap}
						<li class="flex items-center gap-2 text-xs">
							<span class="text-surface-z4 shrink-0">·</span>
							<span class="text-surface-z6">{cap}</span>
						</li>
					{/each}
				</ul>
			</a>
		{/each}
	</div>

	<!-- Footnote on mock/simulated -->
	<p class="text-surface-z4 mt-10 text-center text-xs">
		All platforms authenticate via Supabase in this demo. "Simulated" shows how Kavach's unified API
		would work with that adapter — swap one file to go live.
	</p>
</div>
