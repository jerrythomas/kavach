<script>
	import { Code } from '@rokkit/ui'
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
	<h1 class="mb-4 text-3xl font-bold">Auth0 Adapter</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Authenticate users using Auth0 with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/adapter-auth0`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration</h2>
		<Code code={auth0Config} language="js" />
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
					<td class="p-2"><code>PUBLIC_AUTH0_DOMAIN</code></td>
					<td class="p-2">Your Auth0 tenant domain (e.g., myapp.auth0.com)</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_AUTH0_CLIENT_ID</code></td>
					<td class="p-2">Your Auth0 client ID</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, GitHub, Facebook, Apple, Twitter, LinkedIn</li>
			<li><strong>Password:</strong> Email/Password, Passwordless (Email/SMS)</li>
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
					<td class="p-2">✓</td>
				</tr>
				<tr>
					<td class="p-2">Passkey</td>
					<td class="p-2">—</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline">Configure Auth0</a>
			</li>
			<li>
				<a href="/docs/adapters/firebase" class="text-primary hover:underline">Compare Firebase</a>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline">Compare Supabase</a>
			</li>
		</ul>
	</section>
</div>
