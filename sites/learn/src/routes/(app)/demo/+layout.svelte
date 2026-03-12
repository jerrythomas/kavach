<script lang="ts">
	import type { LayoutData } from './$types'
	import { page } from '$app/stores'

	let { data, children }: { data: LayoutData; children: any } = $props()

	const platform = $derived($page.params.platform || 'supabase')
</script>

<div class="bg-surface-z0 text-surface-z9 flex min-h-[calc(100vh-4rem)] flex-col">
	<nav class="bg-surface-z1 border-surface-z3 border-b px-8 py-4">
		<div class="flex items-center justify-between">
			<div class="flex gap-4">
				<a href="/demo/{platform}" class="hover:text-primary transition-colors">Dashboard</a>
				<a href="/demo/{platform}/admin" class="hover:text-primary transition-colors">Admin</a>
				<a href="/demo/{platform}/data" class="hover:text-primary transition-colors">Data</a>
			</div>
			<div class="flex items-center gap-4">
				<select
					class="border-surface-z3 rounded border px-3 py-1 text-sm"
					value={platform}
					onchange={(e) => (window.location.href = `/demo/${e.currentTarget.value}`)}
				>
					<option value="supabase">Supabase</option>
					<option value="firebase">Firebase</option>
					<option value="auth0">Auth0</option>
					<option value="amplify">Amplify</option>
					<option value="convex">Convex</option>
				</select>
				<a href="/demo/{platform}/logout" class="text-surface-z7 hover:text-primary text-sm"
					>Sign Out</a
				>
			</div>
		</div>
	</nav>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
