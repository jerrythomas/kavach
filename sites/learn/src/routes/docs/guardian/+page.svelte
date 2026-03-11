<script>
	const sentrySetup = `import { createSentry } from '@kavach/sentry'

const sentry = createSentry({
  rules: [
    { path: '/', public: true },
    { path: '/auth', public: true },
    { path: '/dashboard', protected: true },
    { path: '/admin', roles: ['admin'] },
    { path: '/moderator', roles: ['moderator', 'admin'] }
  ],
  roleHome: {
    admin: '/admin',
    user: '/dashboard'
  },
  routes: {
    login: '/auth',
    unauthorized: '/unauthorized'
  }
})`

	const sentryProtect = `// In your hooks.server.js
export const handle = async ({ event, resolve }) => {
  // Set session from cookie
  sentry.setSession(event.locals.session)
  
  // Protect route
  const protection = sentry.protect(event.url.pathname)
  
  if (protection.redirect) {
    return new Response(null, {
      status: 302,
      headers: { Location: protection.redirect }
    })
  }
  
  if (protection.status === 401 || protection.status === 403) {
    return new Response(null, {
      status: protection.status
    })
  }
  
  return resolve(event)
}`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Guardian (Sentry)</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Route protection and role-based access control.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/sentry</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Setup</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{sentrySetup}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Protect Routes</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{sentryProtect}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Rule Types</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-surface-z3">
						<th class="py-2">Rule</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-surface-z3">
						<td class="py-2"><code>{'{ path: "/", public: true }'}</code></td>
						<td class="py-2">Public route</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2"><code>{'{ path: "/dashboard", protected: true }'}</code></td>
						<td class="py-2">Any authenticated user</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2"><code>{'{ path: "/admin", roles: ["admin"] }'}</code></td>
						<td class="py-2">Specific role(s)</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">API</h2>
		<div class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">createSentry(options)</h3>
				<p class="text-surface-z7">Create a Sentry instance with rules.</p>
			</div>
			<div>
				<h3 class="font-semibold mb-2">setSession(session)</h3>
				<p class="text-surface-z7">Set current session for protection checks.</p>
			</div>
			<div>
				<h3 class="font-semibold mb-2">protect(path)</h3>
				<p class="text-surface-z7">Check if path is accessible. Returns { '{ status, redirect }' }.</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/authorization" class="text-primary hover:underline">Authorization</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
			<li><a href="/docs/logger" class="text-primary hover:underline">Logger</a></li>
		</ul>
	</section>
</div>
