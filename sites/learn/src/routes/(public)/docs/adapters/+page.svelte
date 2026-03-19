<script>
	import { PLATFORMS } from '$lib/demo/platforms'
</script>

<div class="max-w-4xl space-y-8">
	<div>
		<h1 class="text-surface-z9 mb-3 text-3xl font-extrabold tracking-tight">Adapters</h1>
		<p class="text-surface-z6 max-w-2xl text-base">
			Kavach works with any auth platform through adapters. Swap the adapter in your config — your
			app code stays the same.
		</p>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		{#each PLATFORMS as platform (platform.id)}
			<a
				href="/docs/adapters/{platform.id}"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			>
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

				<div>
					<p class="text-surface-z9 group-hover:text-primary mb-0.5 font-bold transition-colors">
						{platform.name}
					</p>
					<p class="text-surface-z5 text-xs leading-relaxed">{platform.description}</p>
				</div>

				<div class="flex flex-wrap gap-1.5">
					{#each platform.capabilities.slice(0, 3) as cap}
						<span class="bg-surface-z2 text-surface-z5 rounded-full px-2 py-0.5 text-xs">{cap}</span
						>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</div>
