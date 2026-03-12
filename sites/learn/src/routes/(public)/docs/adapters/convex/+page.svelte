<script>
	import { Code } from '@rokkit/ui'
	const convexConfig = `export default {
  adapter: 'convex',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'github', label: 'Continue with GitHub' }
  ],
  env: {
    deploymentUrl: 'PUBLIC_CONVEX_DEPLOYMENT'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Convex Adapter</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Authenticate users using Convex Auth with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/adapter-convex`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration</h2>
		<Code code={convexConfig} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Environment Variables</h2>
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="p-2 text-left">Variable</th>
					<th class="p-2 text-left">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_CONVEX_DEPLOYMENT</code></td>
					<td class="p-2">Your Convex deployment URL</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, GitHub</li>
			<li><strong>Password:</strong> Email/Password</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Capabilities</h2>
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="p-2 text-left">Feature</th>
					<th class="p-2 text-left">Supported</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Authentication</td>
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Data API</td>
					<td class="p-2">—</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">RPC</td>
					<td class="p-2">—</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Logging</td>
					<td class="p-2">—</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Magic Link</td>
					<td class="p-2">—</td>
				</tr>
				<tr>
					<td class="p-2">Passkey</td>
					<td class="p-2">—</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Notes</h2>
		<p class="text-surface-z7">
			The Convex adapter integrates with Convex Auth for authentication. Data access is handled
			natively by Convex functions outside of Kavach's data API layer.
		</p>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline">Configure Convex</a>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline">Compare Supabase</a>
			</li>
			<li>
				<a href="/docs/adapters/firebase" class="text-primary hover:underline">Compare Firebase</a>
			</li>
		</ul>
	</section>
</div>
