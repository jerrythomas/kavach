<script>
	const basic = `<script>
  import { AuthButton } from '@kavach/ui'
<\/script>

<AuthButton provider="google" />`

	const withLabel = `<AuthButton 
  provider="google" 
  label="Sign in with Google" 
/>`

	const oauth = `<AuthButton 
  provider="google" 
  mode="oauth"
  redirectTo="/dashboard"
/>`

	const password = `<AuthButton 
  provider="password"
  mode="password"
/>`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">AuthButton</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Single sign-in button component with built-in loading and error states.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Basic Usage</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{basic}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">With Custom Label</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{withLabel}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">OAuth Flow</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{oauth}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Password Flow</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{password}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Props</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-surface-z3">
						<th class="py-2">Prop</th>
						<th class="py-2">Type</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-surface-z3">
						<td class="py-2">provider</td>
						<td class="py-2">string</td>
						<td class="py-2">Provider name (google, github, etc.)</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">mode</td>
						<td class="py-2">string</td>
						<td class="py-2">oauth, password, otp, passkey</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">label</td>
						<td class="py-2">string</td>
						<td class="py-2">Button text</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">redirectTo</td>
						<td class="py-2">string</td>
						<td class="py-2">Post-login redirect path</td>
					</tr>
					<tr>
						<td class="py-2">scopes</td>
						<td class="py-2">string[]</td>
						<td class="py-2">OAuth scopes to request</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/components/auth-page" class="text-primary hover:underline">AuthPage</a></li>
			<li><a href="/docs/components/auth-provider" class="text-primary hover:underline">AuthProvider</a></li>
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Adapter setup</a></li>
		</ul>
	</section>
</div>
