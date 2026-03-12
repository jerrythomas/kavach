<script lang="ts">
	import { PLATFORMS } from '$lib/demo/platforms'
</script>

<div class="flex min-h-full flex-col items-center justify-center px-6 py-16 sm:px-8">
	<!-- Hero -->
	<div class="mb-12 text-center">
		<h1 class="text-surface-z9 mb-3 text-4xl font-black tracking-tight sm:text-5xl">Kavach Demo</h1>
		<p class="text-surface-z6 mx-auto max-w-md text-base sm:text-lg">
			Learn authentication by doing. Pick a platform, sign in, explore, hit the walls. See Kavach
			work.
		</p>
	</div>

	<!-- Platform grid -->
	<div class="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each PLATFORMS as platform (platform.id)}
			<a
				href="/demo/{platform.id}"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			>
				<!-- Icon + badge row -->
				<div class="flex items-start justify-between">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-xl {platform.iconFallback} bg-opacity-10"
					>
						<span class="{platform.icon} h-10 w-10 text-4xl" aria-hidden="true"></span>
					</div>
					<span
						class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
							? 'bg-success-100 text-success-700'
							: 'bg-surface-z3 text-surface-z5'}"
					>
						{platform.live ? 'LIVE' : 'MOCK'}
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

				<!-- Feature split -->
				<div class="flex flex-col gap-2">
					<div>
						<p class="text-surface-z4 mb-1 text-xs font-semibold tracking-wider uppercase">
							Kavach
						</p>
						<ul class="flex flex-col gap-1">
							{#each platform.kavachFeatures as feature}
								<li class="flex items-center gap-2 text-xs">
									<span class="i-app-shield text-primary h-3 w-3 shrink-0" aria-hidden="true"
									></span>
									<span class="text-surface-z7">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>
					<div>
						<p class="text-surface-z4 mb-1 text-xs font-semibold tracking-wider uppercase">
							{platform.name}
						</p>
						<ul class="flex flex-col gap-1">
							{#each platform.adapterFeatures as feature}
								<li class="flex items-center gap-2 text-xs">
									<span class="text-surface-z4 shrink-0">·</span>
									<span class="text-surface-z6">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Subtitle footer note -->
	<p class="text-surface-z4 mt-12 text-center text-xs">
		Supabase runs live. Firebase, Auth0, Amplify, and Convex use mocked sessions — same demo, no
		real credentials needed.
	</p>
</div>
