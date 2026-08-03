<script>
	const rulesConfig = `rules: [
  { path: '/', public: true },
  { path: '/about', public: true },
  { path: '/dashboard', roles: '*' },
  { path: '/admin', roles: ['admin'] },
  { path: '/moderator', roles: ['moderator', 'admin'] },
  { path: '/api/data', roles: ['user', 'admin'] }
]`

	const homeResolver = `routes: {
  // per-role landing after login — string or async (session) => path
  home: async (session) =>
    session.user.role === 'admin' ? '/admin' : '/dashboard'
}`

	const fallbackConfig = `rules: [
  // per-route override on denial: a string redirects, a number sets the status
  { path: '/beta', roles: ['tester'], fallback: '/waitlist' },
  { path: '/secret', roles: ['admin'], fallback: 404 }
]`

	const sentryCode = `import { createSentry } from '@kavach/sentry'

const sentry = createSentry({
  rules: [
    { path: '/admin', roles: ['admin'] },
    { path: '/dashboard', roles: '*' }
  ],
  app: {
    login: '/auth',
    home: async (session) =>
      session.user.role === 'admin' ? '/admin' : '/dashboard'
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
				<h3 class="mb-2 font-semibold">roles: '*'</h3>
				<p class="text-surface-z7">
					Any authenticated user. This is the default when <code>roles</code> is omitted, so a non-public
					rule already requires a session.
				</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">roles: ['role1', 'role2']</h3>
				<p class="text-surface-z7">Restricts access to specific roles.</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">fallback</h3>
				<p class="text-surface-z7">
					Per-route override on denial — a string redirects there, a number sets the status.
				</p>
				<pre class="bg-surface-z1 mt-2 overflow-x-auto rounded-lg p-4"><code>{fallbackConfig}</code
					></pre>
			</div>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Role-Based Landing</h2>
		<p class="mb-4">
			After login, send users to a role-specific page by making <code>routes.home</code> a function
			of the session (there is no <code>roleHome</code> map):
		</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{homeResolver}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Using Sentry</h2>
		<p class="mb-4">For fine-grained control, use Sentry directly:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{sentryCode}</code></pre>
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
						<td class="py-2">Unauthenticated → protected page</td>
						<td class="py-2">401 → redirect to auth (login)</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Wrong role</td>
						<td class="py-2">403 → redirect to unauthorized ?? home</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Signed in, visiting the login page</td>
						<td class="py-2">302 → redirect to home (resolved per session)</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">API / endpoint route unauthorized</td>
						<td class="py-2">401/403 status code (no redirect)</td>
					</tr>
					<tr>
						<td class="py-2">Matched rule has a <code>fallback</code></td>
						<td class="py-2">Overrides the above (status or redirect)</td>
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
				<a href="/docs/sentry" class="text-primary hover:underline">Sentry documentation</a>
			</li>
		</ul>
	</section>
</div>
