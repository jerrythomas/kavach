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
	<h1 class="text-3xl font-bold mb-4">Session Management</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		How Kavach handles user sessions with cookie-based storage.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">How It Works</h2>
		<p class="mb-4">Kavach uses stateless cookie-based sessions. No server-side session storage required.</p>
		
		<div class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">1. Authentication</h3>
				<p class="text-surface-z7">User signs in via adapter → adapter returns tokens</p>
			</div>
			<div>
				<h3 class="font-semibold mb-2">2. Cookie Storage</h3>
				<p class="text-surface-z7">Session stored in httpOnly cookie (not accessible to JavaScript)</p>
			</div>
			<div>
				<h3 class="font-semibold mb-2">3. Request Verification</h3>
				<p class="text-surface-z7">Every request validates session via SvelteKit hook</p>
			</div>
			<div>
				<h3 class="font-semibold mb-2">4. Token Refresh</h3>
				<p class="text-surface-z7">Session endpoint refreshes tokens automatically</p>
			</div>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Setup</h2>
		<p class="mb-4">Add the handle hook in <code>src/hooks.server.js</code>:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{hooksCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Session Shape</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{sessionShape}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Client Access</h2>
		<p class="mb-4">Access session from client-side:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{clientCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Cookie Options</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{cookieOptions}</code></pre>
		<p class="mt-4 text-surface-z7">Sessions last 7 days by default.</p>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/authentication" class="text-primary hover:underline">Authentication flows</a></li>
			<li><a href="/docs/authorization" class="text-primary hover:underline">Authorization</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
		</ul>
	</section>
</div>
