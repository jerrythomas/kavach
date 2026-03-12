<script>
	import { Code } from '@rokkit/ui'
	const guardianSetup = `import { createGuardian } from '@kavach/guardian'

const guardian = createGuardian({
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

	const guardianProtect = `// In your hooks.server.js
export const handle = async ({ event, resolve }) => {
  // Set session from cookie
  guardian.setSession(event.locals.session)

  // Protect route
  const protection = guardian.protect(event.url.pathname)

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

	const kavachHandle = `// Simpler: use kavach.handle directly (recommended)
import { kavach } from '$kavach/auth'

export const handle = kavach.handle`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Guardian</h1>

	<p class="text-surface-z7 mb-8 text-lg">Route protection and role-based access control.</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/guardian`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Recommended Usage</h2>
		<p class="mb-4">
			When using Kavach, the guardian is managed automatically via <code>kavach.handle</code>:
		</p>
		<Code code={kavachHandle} language="js" />
		<p class="text-surface-z7 mt-4">
			Route rules are defined in <code>kavach.config.js</code> and applied automatically.
		</p>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Standalone Setup</h2>
		<p class="mb-4">You can also use the guardian independently:</p>
		<Code code={guardianSetup} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Protect Routes</h2>
		<Code code={guardianProtect} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Rule Types</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Rule</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-b">
						<td class="py-2"><code>{'{ path: "/", public: true }'}</code></td>
						<td class="py-2">Public route</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2"><code>{'{ path: "/dashboard", protected: true }'}</code></td>
						<td class="py-2">Any authenticated user</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2"><code>{'{ path: "/admin", roles: ["admin"] }'}</code></td>
						<td class="py-2">Specific role(s)</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">API</h2>
		<div class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold">createGuardian(options)</h3>
				<p class="text-surface-z7">Create a Guardian instance with rules.</p>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">guardian.setSession(session)</h3>
				<p class="text-surface-z7">Set current session for protection checks.</p>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">guardian.protect(path)</h3>
				<p class="text-surface-z7">
					Check if path is accessible. Returns {'{ status, redirect? }'}.
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
			<li><a href="/docs/logger" class="text-primary hover:underline">Logger</a></li>
		</ul>
	</section>
</div>
