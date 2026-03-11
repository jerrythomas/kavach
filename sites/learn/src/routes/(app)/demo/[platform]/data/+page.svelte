<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-2xl font-bold">Data Operations</h1>
	
	<div class="p-4 bg-info-100 border border-info-300 rounded-lg">
		<p class="text-info-900">Demonstrates CRUD operations with role-based access control.</p>
	</div>
	
	<div class="border border-surface-z3 rounded-lg p-6">
		<h2 class="text-xl font-semibold mb-4">Sample Data</h2>
		<div class="space-y-2">
			<div class="p-3 bg-surface-z1 rounded">
				<p class="font-medium">Item 1</p>
				<p class="text-sm text-surface-z7">Sample data item</p>
			</div>
			<div class="p-3 bg-surface-z1 rounded">
				<p class="font-medium">Item 2</p>
				<p class="text-sm text-surface-z7">Another sample item</p>
			</div>
		</div>
	</div>
</div>
