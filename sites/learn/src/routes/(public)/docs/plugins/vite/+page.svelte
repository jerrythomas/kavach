<script>
	const viteConfig = `import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    kavach(),     // must come before sveltekit()
    sveltekit()
  ]
})`

	const viteConfigCustomPath = `import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    kavach({ configPath: './config/kavach.config.js' }),
    sveltekit()
  ]
})`

	const hooksUsage = `// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle`

	const clientUsage = `// src/routes/+layout.svelte
const { adapter, logger } = await import('$kavach/auth')`
	import { Code } from '@rokkit/ui'
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Vite Plugin</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		The Kavach Vite plugin reads <code>kavach.config.js</code> and generates the
		<code>$kavach/auth</code> virtual module at build time. Required for SvelteKit integration.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/vite`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Setup</h2>
		<p class="mb-4">
			Add to <code>vite.config.js</code>. The plugin must be listed before <code>sveltekit()</code>:
		</p>
		<Code code={viteConfig} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Custom Config Path</h2>
		<p class="mb-4">
			By default the plugin looks for <code>kavach.config.js</code> in the project root. You can override
			this:
		</p>
		<Code code={viteConfigCustomPath} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Options Reference</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Option</th>
						<th class="py-2">Type</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="py-2">configPath</td>
						<td class="py-2">string</td>
						<td class="py-2"
							>Path to <code>kavach.config.js</code>. Defaults to
							<code>&lt;root&gt;/kavach.config.js</code></td
						>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">What It Generates</h2>
		<p class="mb-4">
			The plugin generates the <code>$kavach/auth</code> virtual module which exports:
		</p>
		<ul class="mb-4 space-y-1">
			<li><code>kavach</code> — configured server-side instance with <code>.handle</code> hook</li>
			<li><code>adapter</code> — instantiated adapter (e.g. SupabaseAdapter)</li>
			<li><code>logger</code> — configured logger instance</li>
		</ul>
		<Code code={hooksUsage} language="js" />
		<div class="mt-4">
			<Code code={clientUsage} language="js" />
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Features</h2>
		<ul class="space-y-2">
			<li>
				<strong>Virtual Module</strong> — Generates <code>$kavach/auth</code> from
				<code>kavach.config.js</code>
			</li>
			<li><strong>Hot Reload</strong> — Restarts the dev server when config changes</li>
			<li>
				<strong>Multi-adapter</strong> — Supports supabase, firebase, auth0, amplify, convex
			</li>
		</ul>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
			<li><a href="/docs/cli" class="text-primary hover:underline">CLI Commands</a></li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Quick Start</a></li>
		</ul>
	</section>
</div>
