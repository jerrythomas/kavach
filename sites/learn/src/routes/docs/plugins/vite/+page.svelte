<script>
	const viteConfig = `import { defineConfig } from 'vite'
import { kavach } from '@kavach/vite'

export default defineConfig({
  plugins: [kavach()]
})`

	const viteConfigOptions = `import { defineConfig } from 'vite'
import { kavach } from '@kavach/vite'

export default defineConfig({
  plugins: [
    kavach({
      adapter: 'supabase',
      generateTypes: true,
      outputPath: './src/lib/kavach.d.ts'
    })
  ]
})`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Vite Plugin</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		The Kavach Vite plugin provides type generation and development convenience.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/vite</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Basic Usage</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{viteConfig}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Options</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{viteConfigOptions}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Options Reference</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-surface-z3">
						<th class="py-2">Option</th>
						<th class="py-2">Type</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-surface-z3">
						<td class="py-2">adapter</td>
						<td class="py-2">string</td>
						<td class="py-2">Auth adapter name</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">generateTypes</td>
						<td class="py-2">boolean</td>
						<td class="py-2">Generate TypeScript types</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">outputPath</td>
						<td class="py-2">string</td>
						<td class="py-2">Output path for generated types</td>
					</tr>
					<tr>
						<td class="py-2">devMode</td>
						<td class="py-2">boolean</td>
						<td class="py-2">Enable dev-specific features</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Features</h2>
		<ul class="space-y-2">
			<li><strong>Type Generation</strong> — Auto-generate TypeScript types from config</li>
			<li><strong>Virtual Module</strong> — Provides <code>$kavach/auth</code> virtual module</li>
			<li><strong>Demo Mode</strong> — Mock adapter for development without credentials</li>
		</ul>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
			<li><a href="/docs/cli" class="text-primary hover:underline">CLI Commands</a></li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Quick Start</a></li>
		</ul>
	</section>
</div>
