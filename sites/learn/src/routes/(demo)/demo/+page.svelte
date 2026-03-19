<script lang="ts">
	import { PLATFORMS } from '$lib/demo/platforms'
</script>

<div class="mx-auto max-w-4xl px-6 py-12 sm:px-8">
	<div class="mb-10">
		<h1 class="text-surface-z9 mb-2 text-3xl font-black">Live Demos</h1>
		<p class="text-surface-z6 text-sm">Try Kavach authentication flows against real backends.</p>
	</div>

	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each PLATFORMS as platform (platform.id)}
			<a
				href="/demo/{platform.id}"
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="flex items-start justify-between">
					<div class="bg-surface-z2 flex h-12 w-12 items-center justify-center rounded-xl">
						<span class="{platform.icon} h-8 w-8" aria-hidden="true"></span>
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
			</a>
		{/each}
	</div>
</div>
