<script>
	const rulesConfig = `rules: [
  { path: '/', public: true },
  { path: '/about', public: true },
  { path: '/dashboard', protected: true },
  { path: '/admin', roles: ['admin'] },
  { path: '/moderator', roles: ['moderator', 'admin'] },
  { path: '/api/data', roles: ['user', 'admin'] }
]`

	const roleHome = `roleHome: {
  admin: '/admin',
  moderator: '/dashboard',
  user: '/dashboard'
}`

	const guardianCode = `import { createSentry } from '@kavach/sentry'

const sentry = createSentry({
  rules: [
    { path: '/admin', roles: ['admin'] },
    { path: '/dashboard', protected: true }
  ],
  roleHome: {
    admin: '/admin',
    user: '/dashboard'
  }
})`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Authorization</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Route protection and role-based access control with Kavach.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Route Rules</h2>
		<p class="mb-4">Define protection rules in your configuration:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{rulesConfig}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Rule Types</h2>

		<div class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold">public: true</h3>
				<p class="text-surface-z7">Accessible without authentication.</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">protected: true</h3>
				<p class="text-surface-z7">Requires authentication (any logged-in user).</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">roles: ['role1', 'role2']</h3>
				<p class="text-surface-z7">Restricts access to specific roles.</p>
			</div>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Role-Based Redirects</h2>
		<p class="mb-4">After login, redirect users to role-specific pages:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{roleHome}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Using Sentry</h2>
		<p class="mb-4">For fine-grained control, use Sentry directly:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{guardianCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Behavior</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Scenario</th>
						<th class="py-2">Behavior</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Unauthenticated → protected</td>
						<td class="py-2">302 redirect to login</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Wrong role</td>
						<td class="py-2">302 redirect to role home</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">API endpoint unauthorized</td>
						<td class="py-2">401/403 status code</td>
					</tr>
					<tr>
						<td class="py-2">Page unauthorized</td>
						<td class="py-2">302 redirect</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline">Configuration options</a>
			</li>
			<li><a href="/docs/session" class="text-primary hover:underline">Session management</a></li>
			<li>
				<a href="/docs/guardian" class="text-primary hover:underline">Sentry documentation</a>
			</li>
		</ul>
	</section>
</div>
