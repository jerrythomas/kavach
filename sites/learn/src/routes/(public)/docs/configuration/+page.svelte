<script>
	import { Code } from '@rokkit/ui'
	const fullConfig = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Google' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' },
    { name: 'email', mode: 'password', label: 'Email' }
  ],
  routes: {
    auth: '(public)/auth',
    data: '(server)/data',
    rpc: '(server)/rpc',
    logout: '/logout'
  },
  rules: [
    { path: '/', public: true },
    { path: '/about', public: true },
    { path: '/dashboard', protected: true },
    { path: '/admin', roles: ['admin'] },
    { path: '/api', roles: ['user', 'admin'] }
  ],
  roleHome: {
    admin: '/admin',
    user: '/dashboard'
  },
  logging: {
    level: 'info',
    table: 'audit_logs'
  }
}`

	const envExample = `# .env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Configuration</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Complete reference for all Kavach configuration options.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration File</h2>
		<p class="mb-4">Create a <code>kavach.config.js</code> file in your project root:</p>
		<Code code={fullConfig} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Environment Variables</h2>
		<p class="mb-4">Add to your <code>.env</code> file:</p>
		<Code code={envExample} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Configuration Options</h2>

		<div class="space-y-6">
			<div>
				<h3 class="mb-2 font-semibold">adapter</h3>
				<p class="text-surface-z7 mb-2">
					Auth provider: <code>supabase</code>, <code>firebase</code>, <code>auth0</code>,
					<code>amplify</code>, <code>convex</code>
				</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">providers</h3>
				<p class="text-surface-z7 mb-2">
					Authentication methods to enable. Each has <code>name</code>, optional <code>mode</code>,
					and <code>label</code>.
				</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">routes</h3>
				<p class="text-surface-z7 mb-2">
					Path configuration for auth flows: <code>auth</code>, <code>logout</code>,
					<code>data</code>
					(optional), <code>rpc</code> (optional).
				</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">rules</h3>
				<p class="text-surface-z7 mb-2">
					Route protection rules. Each rule has <code>path</code>, and either
					<code>public: true</code>, <code>protected: true</code>, or <code>roles</code>.
				</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">roleHome</h3>
				<p class="text-surface-z7 mb-2">Map of roles to redirect targets after login.</p>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">logging</h3>
				<p class="text-surface-z7 mb-2">
					Logging configuration: level (error/warn/info/debug/trace) and optional table name.
				</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/quick-start" class="text-primary hover:underline">Back to Quick Start</a>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline"
					>Configure Supabase adapter</a
				>
			</li>
			<li>
				<a href="/docs/sentry" class="text-primary hover:underline">Learn about route protection</a>
			</li>
		</ul>
	</section>
</div>
