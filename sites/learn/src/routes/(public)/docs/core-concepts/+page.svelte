<script>
	import { Code } from '@rokkit/ui'

	const layoutCode = `<!-- src/routes/+layout.svelte -->
<script>
  import { setContext, onMount } from 'svelte'
  import { page } from '$app/stores'

  const kavach = $state({})
  setContext('kavach', kavach)

  onMount(async () => {
    const { createKavach } = await import('kavach')
    const { adapter, logger } = await import('$kavach/auth')
    const { invalidateAll } = await import('$app/navigation')
    const instance = createKavach(adapter, { logger, invalidateAll })
    Object.assign(kavach, instance)
    instance.onAuthChange($page.url)
  })
<\/script>`

	const signInCode = `<script>
  import { getContext } from 'svelte'
  const kavach = getContext('kavach')
<\/script>

<!-- OAuth -->
<button onclick={() => kavach.signIn({ provider: 'google' })}>Continue with Google</button>

<!-- Email + password -->
<button onclick={() => kavach.signIn({ provider: 'email', email, password })}>Sign in</button>

<!-- Magic link -->
<button onclick={() => kavach.signIn({ provider: 'magic', email })}>Send magic link</button>

<button onclick={() => kavach.signOut()}>Sign out</button>`

	const rulesCode = `// kavach.config.js
export default {
  rules: [
    { path: '/auth',      public: true },       // no auth needed
    { path: '/',          public: true },
    { path: '/dashboard', protected: true },     // any authenticated user
    { path: '/admin',     roles: ['admin'] },    // specific role required
    { path: '/api',       roles: ['user', 'admin'] }
  ],
  roleHome: {
    admin: '/admin',     // where admins land after login
    user:  '/dashboard'
  }
}`

	const sessionChainCode = `// 1. kavach.handle parses the cookie and sets locals.session
// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle

// 2. Pass session to all pages via layout.server
// src/routes/+layout.server.js
export function load({ locals }) {
  return { session: locals.session }
}

// 3. Guard individual routes
// src/routes/dashboard/+page.server.js
import { redirect } from '@sveltejs/kit'
export function load({ locals }) {
  if (!locals.session) redirect(303, '/auth')
  return { user: locals.session.user }
}

// 4. Access in components via $page.data
// src/routes/+page.svelte
<script>
  import { page } from '$app/stores'
  $: user = $page.data.session?.user
<\/script>
<p>Hello {user?.email}</p>`

	const sessionShape = `{
  user: {
    id: 'uuid',
    email: 'user@example.com',
    role: 'user'
  },
  access_token: 'jwt...',
  refresh_token: 'token...',
  expires_in: 3600
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Core Concepts</h1>
	<p class="text-surface-z7 mb-8 text-lg">Authentication, authorization, and session management.</p>

	<!-- Authentication -->
	<h2 class="mt-8 mb-3 text-xl font-semibold">Authentication</h2>
	<p class="text-surface-z7 mb-4">
		Kavach supports OAuth (Google, GitHub, etc.), email + password, magic link (OTP), and passkey.
		You configure providers in <code>kavach.config.js</code> — the UI components and sign-in API work
		the same regardless of which you choose.
	</p>

	<h3 class="mt-6 mb-2 font-semibold">Client-side setup</h3>
	<p class="text-surface-z7 mb-3">
		Create a kavach instance in your root layout and share it via Svelte context. Must run in
		<code>onMount</code> — browser only.
	</p>
	<Code code={layoutCode} language="svelte" />

	<h3 class="mt-6 mb-2 font-semibold">Sign in / sign out</h3>
	<Code code={signInCode} language="svelte" />

	<h3 class="mt-6 mb-2 font-semibold">Auth flows</h3>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="py-2 pr-6">Flow</th>
					<th class="py-2 pr-6">Provider name</th>
					<th class="py-2">Notes</th>
				</tr>
			</thead>
			<tbody>
				{#each [['OAuth', 'google, github, azure, …', 'Redirect-based; adapter must support the provider'], ['Magic link', 'magic', 'OTP via email; set mode: "otp"'], ['Email + password', 'email', 'Set mode: "password"'], ['Passkey', 'passkey', 'WebAuthn; Supabase and Firebase only']] as [flow, name, note]}
					<tr class="border-surface-z3 border-b">
						<td class="py-2 pr-6">{flow}</td>
						<td class="py-2 pr-6"><code>{name}</code></td>
						<td class="text-surface-z6 py-2 text-sm">{note}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Authorization -->
	<h2 class="mt-10 mb-3 text-xl font-semibold">Authorization</h2>
	<p class="text-surface-z7 mb-4">
		Route protection is declared in <code>kavach.config.js</code> and enforced automatically by
		<code>kavach.handle</code> on every request. No per-route auth checks needed.
	</p>

	<h3 class="mt-6 mb-2 font-semibold">Route rules</h3>
	<Code code={rulesCode} language="js" />

	<h3 class="mt-6 mb-2 font-semibold">How rules are evaluated</h3>
	<ul class="text-surface-z7 mb-4 list-inside list-disc space-y-1 text-sm">
		<li>Rules are prefix-matched in order — first match wins</li>
		<li><code>public: true</code> — accessible without authentication</li>
		<li><code>protected: true</code> — requires any valid session</li>
		<li><code>roles: ['admin']</code> — requires one of the listed roles</li>
		<li>Unauthenticated access to protected route → redirect to auth route</li>
		<li>Wrong role → redirect to <code>roleHome[role]</code> or auth route</li>
	</ul>

	<!-- Session -->
	<h2 class="mt-10 mb-3 text-xl font-semibold">Session Management</h2>
	<p class="text-surface-z7 mb-4">
		Kavach uses stateless cookie-based sessions — no server-side session store required. The session
		is stored in an httpOnly cookie, parsed on each request by <code>kavach.handle</code>, and
		available as <code>event.locals.session</code> in all load functions.
	</p>

	<h3 class="mt-6 mb-2 font-semibold">The full session chain</h3>
	<Code code={sessionChainCode} language="js" />

	<h3 class="mt-6 mb-2 font-semibold">Session shape</h3>
	<Code code={sessionShape} language="js" />

	<h3 class="mt-6 mb-2 font-semibold">Token refresh</h3>
	<p class="text-surface-z7 mb-4">
		When the adapter fires an auth state change (e.g. after OAuth callback), the client POSTs to
		<code>/auth/session</code>. The server validates the token via the adapter, writes a fresh
		cookie, and calls <code>invalidateAll()</code> to re-run load functions.
	</p>

	<h2 class="mt-8 mb-3 text-xl font-semibold">Next Steps</h2>
	<ul class="space-y-2">
		<li>
			<a href="/docs/adapters/supabase" class="text-primary hover:underline"
				>Configure your adapter</a
			>
		</li>
		<li>
			<a href="/docs/configuration" class="text-primary hover:underline"
				>Full configuration reference</a
			>
		</li>
		<li><a href="/docs/cli" class="text-primary hover:underline">CLI reference</a></li>
	</ul>
</div>
