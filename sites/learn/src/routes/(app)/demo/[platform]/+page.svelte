<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'

	let { data }: { data: PageData } = $props()
	
	const platform = $derived($page.params.platform || 'supabase')
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-2xl font-bold">Welcome to Kavach Demo!</h1>
	
	<div class="p-4 bg-info-100 border border-info-300 rounded-lg">
		<p class="text-info-900">Using adapter: <strong class="uppercase">{platform}</strong></p>
	</div>
	
	{#if data.user}
		<div class="p-4 border border-surface-z3 rounded-lg">
			<h2 class="text-lg font-semibold mb-2">User Info</h2>
			<p class="text-surface-z7">Email: <strong>{data.user.email}</strong></p>
			<p class="text-surface-z7">Role: <strong>{data.user.role || 'user'}</strong></p>
		</div>
	{/if}
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
		<a href="/demo/{platform}/data" class="p-6 border border-surface-z3 rounded-lg hover:bg-surface-z1 transition-colors">
			<h3 class="text-lg font-semibold mb-2">CRUD Demo</h3>
			<p class="text-surface-z7">Test data operations with role-based access</p>
		</a>
		<a href="/demo/{platform}/admin" class="p-6 border border-surface-z3 rounded-lg hover:bg-surface-z1 transition-colors">
			<h3 class="text-lg font-semibold mb-2">Admin Panel</h3>
			<p class="text-surface-z7">Admin-only features and controls</p>
		</a>
	</div>
</div>
