<script>
	import { Code } from '@rokkit/ui'
	const supabaseConfig = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'github', label: 'Continue with GitHub' }
  ],
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Supabase Adapter</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Authenticate users using Supabase Auth with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/adapter-supabase`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration</h2>
		<Code code={supabaseConfig} language="js" />
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
					<td class="p-2"><code>PUBLIC_SUPABASE_URL</code></td>
					<td class="p-2">Your Supabase project URL</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_SUPABASE_ANON_KEY</code></td>
					<td class="p-2">Your Supabase anon key</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, GitHub, Facebook, Apple, Twitter</li>
			<li><strong>Password:</strong> Email/Password, Magic Link (OTP)</li>
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
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">RPC</td>
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Logging</td>
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2">Magic Link</td>
					<td class="p-2">✓</td>
				</tr>
				<tr class="border-surface-z3 border-b">
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
				<a href="/docs/configuration" class="text-primary hover:underline"
					>Configure more providers</a
				>
			</li>
			<li>
				<a href="/docs/quick-start" class="text-primary hover:underline">Back to Quick Start</a>
			</li>
		</ul>
	</section>
</div>
