<script>
	const amplifyConfig = `export default {
  adapter: 'amplify',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'facebook', label: 'Continue with Facebook' }
  ],
  env: {
    region: 'PUBLIC_AWS_REGION',
    userPoolId: 'PUBLIC_COGNITO_USER_POOL_ID',
    userPoolClientId: 'PUBLIC_COGNITO_CLIENT_ID'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">AWS Amplify Adapter</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Authenticate users using AWS Amplify (Cognito) with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/amplify</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{amplifyConfig}</code></pre>
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
					<td class="p-2"><code>PUBLIC_AWS_REGION</code></td>
					<td class="p-2">AWS region (e.g., us-east-1)</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>PUBLIC_COGNITO_USER_POOL_ID</code></td>
					<td class="p-2">Cognito User Pool ID</td>
				</tr>
				<tr class="border-b border-surface-z3">
					<td class="p-2"><code>PUBLIC_COGNITO_CLIENT_ID</code></td>
					<td class="p-2">Cognito App Client ID</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, Facebook, Amazon, Apple</li>
			<li><strong>Password:</strong> Email/Password</li>
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
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configure Amplify</a></li>
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Compare Supabase</a></li>
			<li><a href="/docs/adapters/firebase" class="text-primary hover:underline">Compare Firebase</a></li>
		</ul>
	</section>
</div>
