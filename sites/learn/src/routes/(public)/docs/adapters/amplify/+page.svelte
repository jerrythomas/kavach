<script>
	import { Code } from '@rokkit/ui'
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
	<h1 class="mb-4 text-3xl font-bold">AWS Amplify Adapter</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Authenticate users using AWS Amplify (Cognito) with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/adapter-amplify`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration</h2>
		<Code code={amplifyConfig} language="js" />
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
					<td class="p-2"><code>PUBLIC_AWS_REGION</code></td>
					<td class="p-2">AWS region (e.g., us-east-1)</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_COGNITO_USER_POOL_ID</code></td>
					<td class="p-2">Cognito User Pool ID</td>
				</tr>
				<tr class="border-surface-z3 border-b">
					<td class="p-2"><code>PUBLIC_COGNITO_CLIENT_ID</code></td>
					<td class="p-2">Cognito App Client ID</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, Facebook, Amazon, Apple</li>
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

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline">Configure Amplify</a>
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
