<script>
	const basic = `<script>
  import { AuthPage } from '@kavach/ui'
<\/script>

<AuthPage />`

	const withProviders = `<script>
  import { AuthPage } from '@kavach/ui'
<\/script>

<AuthPage 
  providers={[
    { name: 'google', label: 'Google' },
    { name: 'github', label: 'GitHub' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' },
    { name: 'password', mode: 'password', label: 'Email' }
  ]}
/>`

	const withCallbacks = `<AuthPage 
  providers={[...]}
  onSuccess={() => {
    goto('/dashboard')
  }}
  onError={(error) => {
    console.error(error)
  }}
/>`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">AuthPage</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Complete authentication page with cached logins, provider buttons, and credential forms.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Basic Usage</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{basic}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">With Providers</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{withProviders}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">With Callbacks</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{withCallbacks}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Features</h2>
		<ul class="space-y-2">
			<li><strong>Cached Logins</strong> — Shows recent logins at top for quick access</li>
			<li><strong>Collapsible Forms</strong> — Provider groups can collapse</li>
			<li><strong>Passkey Support</strong> — Shows passkey option if adapter supports it</li>
			<li><strong>Loading States</strong> — Built-in loading indicators</li>
			<li><strong>Error Display</strong> — Shows auth errors inline</li>
		</ul>
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
						<td class="py-2">providers</td>
						<td class="py-2">Provider[]</td>
						<td class="py-2">Auth providers to display</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">onSuccess</td>
						<td class="py-2">function</td>
						<td class="py-2">Called on successful auth</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">onError</td>
						<td class="py-2">function</td>
						<td class="py-2">Called on auth error</td>
					</tr>
					<tr>
						<td class="py-2">cachedLogins</td>
						<td class="py-2">boolean</td>
						<td class="py-2">Enable cached login cards</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/components/login-card" class="text-primary hover:underline">LoginCard</a></li>
			<li><a href="/docs/components/auth-provider" class="text-primary hover:underline">AuthProvider</a></li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Quick Start</a></li>
		</ul>
	</section>
</div>
