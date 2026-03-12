<script lang="ts">
	import type { LayoutData } from './$types'
	import { page } from '$app/stores'

	let { data, children }: { data: LayoutData; children: any } = $props()

	const platform = $derived($page.params.platform || 'supabase')

	const platforms = [
		{ id: 'supabase', name: 'Supabase', desc: 'Open-source BaaS', live: true },
		{ id: 'firebase', name: 'Firebase', desc: 'Google cloud', live: false },
		{ id: 'auth0', name: 'Auth0', desc: 'Auth-as-a-service', live: false },
		{ id: 'amplify', name: 'Amplify', desc: 'AWS backend', live: false },
		{ id: 'convex', name: 'Convex', desc: 'Reactive DB', live: false }
	]
</script>

<div class="bg-surface-z0 text-surface-z9 flex min-h-[calc(100vh-4rem)] flex-col">
	<nav class="bg-surface-z1 border-surface-z3 border-b px-8 py-3">
		<div class="flex items-center justify-between gap-4">
			<div class="flex gap-4">
				<a href="/demo/{platform}" class="hover:text-primary text-sm transition-colors">Dashboard</a
				>
				<a href="/demo/{platform}/data" class="hover:text-primary text-sm transition-colors"
					>Space Facts</a
				>
				<a href="/demo/{platform}/admin" class="hover:text-primary text-sm transition-colors"
					>Admin</a
				>
			</div>

			<div class="flex items-center gap-2">
				{#each platforms as p (p.id)}
					<a
						href="/demo/{p.id}"
						title={p.desc}
						class="border-surface-z3 hover:border-primary flex flex-col items-center rounded-md border px-3 py-1.5 transition-colors"
						class:border-primary={platform === p.id}
						class:bg-primary={platform === p.id}
						class:text-white={platform === p.id}
					>
						<span class="text-xs font-semibold">{p.name}</span>
						{#if !p.live}
							<span
								class="text-warning-600"
								class:text-white={platform === p.id}
								style={platform === p.id ? 'opacity:0.8' : ''}
								style:font-size="0.6rem">mock</span
							>
						{/if}
					</a>
				{/each}

				<a
					href="/demo/{platform}/logout"
					class="text-surface-z7 hover:text-primary ml-2 text-sm transition-colors">Sign Out</a
				>
			</div>
		</div>
	</nav>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
