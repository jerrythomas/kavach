<script>
	const configCode = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'magic', mode: 'otp', label: 'Email for Magic Link' }
  ],
  routes: {
    home: '/',
    auth: '/auth',
    logout: '/logout'
  },
  rules: [
    { path: '/', public: true },
    { path: '/dashboard', roles: ['user', 'admin'] },
    { path: '/admin', roles: ['admin'] }
  ]
}`

	const hooksCode = `import { kavach } from '$kavach/auth'

export const handle = kavach.handle`

	const componentCode = `import { AuthPage } from '@kavach/ui'

<AuthPage />`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Quick Start</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Get up and running with Kavach in just a few minutes.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">1. Install Packages</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/client @kavach/guardian @kavach/ui @kavach/vite</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">2. Configure Kavach</h2>
		<p class="mb-4">Create a <code>kavach.config.js</code> file in your project root:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{configCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">3. Set Up Hooks</h2>
		<p class="mb-4">Add authentication to your <code>src/hooks.server.js</code>:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{hooksCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">4. Use Components</h2>
		<p class="mb-4">Add authentication UI to your app:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{componentCode}</code></pre>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/configuration" class="text-primary hover:underline">Learn about configuration options</a></li>
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Set up your preferred adapter</a></li>
			<li><a href="/docs/guardian" class="text-primary hover:underline">Configure route protection</a></li>
		</ul>
	</section>
</div>
