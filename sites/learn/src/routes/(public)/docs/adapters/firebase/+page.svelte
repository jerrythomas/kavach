<script>
	import { Code } from '@rokkit/ui'
	const configCode = `export default {
  adapter: 'firebase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'password', label: 'Email/Password' }
  ],
  env: {
    apiKey: 'PUBLIC_FIREBASE_API_KEY',
    authDomain: 'PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'PUBLIC_FIREBASE_PROJECT_ID'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Firebase Adapter</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Authenticate users using Firebase Auth with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/adapter-firebase`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration</h2>
		<Code code={configCode} language="js" />
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
					<td class="p-2"><code>PUBLIC_FIREBASE_API_KEY</code></td>
					<td class="p-2">Firebase web API key</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_FIREBASE_AUTH_DOMAIN</code></td>
					<td class="p-2">Firebase auth domain (e.g., myapp.firebaseapp.com)</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_FIREBASE_PROJECT_ID</code></td>
					<td class="p-2">Firebase project ID</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, Facebook, Twitter, Apple, GitHub</li>
			<li><strong>Password:</strong> Email/Password</li>
			<li><strong>Magic Link:</strong> Email OTP</li>
			<li><strong>Passkey:</strong> WebAuthn passkeys</li>
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
					<td class="p-2">✓</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline">Supabase Adapter</a>
			</li>
			<li><a href="/docs/adapters/auth0" class="text-primary hover:underline">Auth0 Adapter</a></li>
		</ul>
	</section>
</div>
