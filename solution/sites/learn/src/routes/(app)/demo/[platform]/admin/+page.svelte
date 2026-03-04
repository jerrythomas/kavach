<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-2xl font-bold">Admin Panel</h1>
	
	<div class="p-4 bg-warning-100 border border-warning-300 rounded-lg">
		<p class="text-warning-900">This page is only accessible to users with admin role.</p>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
		<div class="p-6 border border-surface-z3 rounded-lg">
			<h3 class="text-lg font-semibold mb-2">User Management</h3>
			<p class="text-surface-z7">Manage users and their roles</p>
		</div>
		<div class="p-6 border border-surface-z3 rounded-lg">
			<h3 class="text-lg font-semibold mb-2">System Settings</h3>
			<p class="text-surface-z7">Configure system-wide settings</p>
		</div>
	</div>
</div>
