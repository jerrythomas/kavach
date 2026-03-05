<script>
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
	<h1 class="text-3xl font-bold mb-4">Supabase Adapter</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Authenticate users using Supabase Auth with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/supabase</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{supabaseConfig}</code></pre>
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
					<td class="p-2"><code>PUBLIC_SUPABASE_URL</code></td>
					<td class="p-2">Your Supabase project URL</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>PUBLIC_SUPABASE_ANON_KEY</code></td>
					<td class="p-2">Your Supabase anon key</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, GitHub, Facebook, Apple, Twitter</li>
			<li><strong>Password:</strong> Email/Password, Magic Link (OTP)</li>
		</ul>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configure more providers</a></li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Back to Quick Start</a></li>
		</ul>
	</section>
</div>
