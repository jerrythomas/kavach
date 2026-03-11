<script>
	const auth0Config = `export default {
  adapter: 'auth0',
  providers: [
    { name: 'auth0', label: 'Continue with Auth0' }
  ],
  env: {
    domain: 'PUBLIC_AUTH0_DOMAIN',
    clientId: 'PUBLIC_AUTH0_CLIENT_ID'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Auth0 Adapter</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Authenticate users using Auth0 with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/auth0</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{auth0Config}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Environment Variables</h2>
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-surface-z3">
					<th class="text-left p-2">Variable</th>
					<th class="text-left p-2">Description</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>PUBLIC_AUTH0_DOMAIN</code></td>
					<td class="p-2">Your Auth0 tenant domain (e.g., myapp.auth0.com)</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>PUBLIC_AUTH0_CLIENT_ID</code></td>
					<td class="p-2">Your Auth0 client ID</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, GitHub, Facebook, Apple, Twitter, LinkedIn</li>
			<li><strong>Password:</strong> Email/Password, Passwordless (Email/SMS)</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Capabilities</h2>
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-surface-z3">
					<th class="text-left p-2">Feature</th>
					<th class="text-left p-2">Supported</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-surface-z3">
					<td class="p-2">Authentication</td>
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2">Data API</td>
					<td class="p-2">—</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2">File Storage</td>
					<td class="p-2">—</td>
				</tr>
				<tr>
					<td class="p-2">Logging</td>
					<td class="p-2">—</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configure Auth0</a></li>
			<li><a href="/docs/adapters/firebase" class="text-primary hover:underline">Compare Firebase</a></li>
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Compare Supabase</a></li>
		</ul>
	</section>
</div>
