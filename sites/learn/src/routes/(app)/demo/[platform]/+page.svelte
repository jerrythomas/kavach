<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'

	let { data }: { data: PageData } = $props()

	const platform = $derived($page.params.platform || 'supabase')
</script>

<div class="flex flex-col gap-4 p-8">
	<h1 class="text-2xl font-bold">Welcome to Kavach Demo!</h1>

	<div class="bg-surface-z2 border-surface-z3 rounded-lg border p-4">
		<p class="text-surface-z8">Using adapter: <strong class="uppercase">{platform}</strong></p>
	</div>

	{#if data.user}
		<div class="border-surface-z3 rounded-lg border p-4">
			<h2 class="mb-2 text-lg font-semibold">User Info</h2>
			<p class="text-surface-z7">Email: <strong>{data.user.email}</strong></p>
			<p class="text-surface-z7">Role: <strong>{data.user.role || 'user'}</strong></p>
		</div>
	{/if}

	<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
		<a
			href="/demo/{platform}/data"
			class="border-surface-z3 hover:bg-surface-z1 rounded-lg border p-6 transition-colors"
		>
			<h3 class="mb-2 text-lg font-semibold">CRUD Demo</h3>
			<p class="text-surface-z7">Test data operations with role-based access</p>
		</a>
		<a
			href="/demo/{platform}/admin"
			class="border-surface-z3 hover:bg-surface-z1 rounded-lg border p-6 transition-colors"
		>
			<h3 class="mb-2 text-lg font-semibold">Admin Panel</h3>
			<p class="text-surface-z7">Admin-only features and controls</p>
		</a>
	</div>
</div>
