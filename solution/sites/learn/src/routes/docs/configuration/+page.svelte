<script>
	const fullConfig = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Google' },
    { name: 'github', label: 'GitHub' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' },
    { name: 'password', mode: 'password', label: 'Email' }
  ],
  routes: {
    home: '/',
    auth: '/auth',
    logout: '/logout',
    session: '/auth/session',
    unauthorized: '/unauthorized'
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
  dataRoute: '/api/data',
  rpcRoute: '/api/rpc',
  logging: {
    level: 'info',
    table: 'audit_logs'
  }
}`

	const envExample = `# .env
KAVACH_ADAPTER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
KAVACH_SECRET=your-secret-key`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Configuration</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Complete reference for all Kavach configuration options.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration File</h2>
		<p class="mb-4">Create a <code>kavach.config.js</code> file in your project root:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{fullConfig}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Environment Variables</h2>
		<p class="mb-4">Add to your <code>.env</code> file:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{envExample}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration Options</h2>
		
		<div class="space-y-6">
			<div>
				<h3 class="font-semibold mb-2">adapter</h3>
				<p class="text-surface-z7 mb-2">Auth provider: <code>supabase</code>, <code>firebase</code>, <code>auth0</code>, <code>amplify</code>, <code>convex</code></p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">providers</h3>
				<p class="text-surface-z7 mb-2">Authentication methods to enable. Each has <code>name</code>, optional <code>mode</code>, and <code>label</code>.</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">routes</h3>
				<p class="text-surface-z7 mb-2">Path configuration for auth flows: home, auth, logout, session, unauthorized.</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">rules</h3>
				<p class="text-surface-z7 mb-2">Route protection rules. Each rule has <code>path</code>, and either <code>public: true</code>, <code>protected: true</code>, or <code>roles</code>.</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">roleHome</h3>
				<p class="text-surface-z7 mb-2">Map of roles to redirect targets after login.</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">dataRoute</h3>
				<p class="text-surface-z7 mb-2">Enable data API at this path. Only for adapters with data support (Supabase, Firebase).</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">rpcRoute</h3>
				<p class="text-surface-z7 mb-2">Enable RPC API at this path. Only for adapters with RPC support.</p>
			</div>

			<div>
				<h3 class="font-semibold mb-2">logging</h3>
				<p class="text-surface-z7 mb-2">Logging configuration: level (error/warn/info/debug/trace) and optional table name.</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Back to Quick Start</a></li>
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Configure Supabase adapter</a></li>
			<li><a href="/docs/guardian" class="text-primary hover:underline">Learn about route protection</a></li>
		</ul>
	</section>
</div>
