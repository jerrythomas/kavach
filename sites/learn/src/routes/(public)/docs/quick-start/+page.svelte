<script>
	import { Code } from '@rokkit/ui'
	const configCode = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'magic', mode: 'otp', label: 'Email for Magic Link' }
  ],
  routes: {
    auth: '(public)/auth',
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
	<h1 class="mb-4 text-3xl font-bold">Quick Start</h1>

	<p class="text-surface-z7 mb-8 text-lg">Get up and running with Kavach in just a few minutes.</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">1. Install Packages</h2>
		<Code code={`npm install kavach @kavach/sentry @kavach/ui @kavach/vite`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">2. Configure Kavach</h2>
		<p class="mb-4">Create a <code>kavach.config.js</code> file in your project root:</p>
		<Code code={configCode} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">3. Set Up Hooks</h2>
		<p class="mb-4">Add authentication to your <code>src/hooks.server.js</code>:</p>
		<Code code={hooksCode} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">4. Use Components</h2>
		<p class="mb-4">Add authentication UI to your app:</p>
		<Code code={componentCode} language="svelte" />
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline"
					>Learn about configuration options</a
				>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline"
					>Set up your preferred adapter</a
				>
			</li>
			<li>
				<a href="/docs/sentry" class="text-primary hover:underline">Configure route protection</a>
			</li>
		</ul>
	</section>
</div>
