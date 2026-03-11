<script>
	const initCode = `npx kavach init`

	const addCode = `npx kavach add auth-page
npx kavach add routes`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">CLI Commands</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Kavach CLI helps you set up authentication in your SvelteKit projects.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">init</h2>
		<p class="mb-4">Initialize Kavach in your project with interactive prompts:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{initCode}</code></pre>
		<p class="mt-4 text-surface-z7">This command will:</p>
		<ul class="list-disc list-inside space-y-1 mt-2 text-surface-z7">
			<li>Prompt for authentication adapter selection</li>
			<li>Configure OAuth providers</li>
			<li>Set up route protection rules</li>
			<li>Generate necessary configuration files</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">add</h2>
		<p class="mb-4">Add pre-built components to your project:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{addCode}</code></pre>
		<table class="w-full mt-4 border-collapse">
			<thead>
				<tr class="border-b border-surface-z3">
					<th class="text-left p-2">Command</th>
					<th class="text-left p-2">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>kavach add auth-page</code></td>
					<td class="p-2">Generate authentication page with all configured providers</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>kavach add routes</code></td>
					<td class="p-2">Generate data and RPC route handlers</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Options</h2>
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-surface-z3">
					<th class="text-left p-2">Option</th>
					<th class="text-left p-2">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>--template</code></td>
					<td class="p-2">Choose a template (default, cached)</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>--force</code></td>
					<td class="p-2">Overwrite existing files</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Back to Quick Start</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Learn about configuration</a></li>
		</ul>
	</section>
</div>
