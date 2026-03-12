<script>
	const hooksCode = `import { kavach } from '$kavach/auth'

export const handle = kavach.handle`

	const sessionShape = `{
  user: {
    id: 'user-uuid',
    email: 'user@example.com',
    role: 'admin',
    app_metadata: {},
    ...
  },
  access_token: 'jwt-token',
  refresh_token: 'refresh-token',
  expires_in: 3600
}`

	const clientCode = `import { kavach } from '$kavach/auth'

// Get current session
const session = kavach.getSession()

// Check if authenticated
if (session?.user) {
  console.log('User:', session.user.email)
}`

	const cookieOptions = `{
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 604800 // 7 days
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Session Management</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		How Kavach handles user sessions with cookie-based storage.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">How It Works</h2>
		<p class="mb-4">
			Kavach uses stateless cookie-based sessions. No server-side session storage required.
		</p>

		<div class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold">1. Authentication</h3>
				<p class="text-surface-z7">User signs in via adapter → adapter returns tokens</p>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">2. Cookie Storage</h3>
				<p class="text-surface-z7">
					Session stored in httpOnly cookie (not accessible to JavaScript)
				</p>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">3. Request Verification</h3>
				<p class="text-surface-z7">Every request validates session via SvelteKit hook</p>
			</div>
			<div>
				<h3 class="mb-2 font-semibold">4. Token Refresh</h3>
				<p class="text-surface-z7">Session endpoint refreshes tokens automatically</p>
			</div>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Setup</h2>
		<p class="mb-4">Add the handle hook in <code>src/hooks.server.js</code>:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{hooksCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Session Shape</h2>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{sessionShape}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Client Access</h2>
		<p class="mb-4">Access session from client-side:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{clientCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Cookie Options</h2>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{cookieOptions}</code></pre>
		<p class="text-surface-z7 mt-4">Sessions last 7 days by default.</p>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/authentication" class="text-primary hover:underline">Authentication flows</a>
			</li>
			<li><a href="/docs/authorization" class="text-primary hover:underline">Authorization</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
		</ul>
	</section>
</div>
