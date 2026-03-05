<script>
	const configCode = `export default {
  adapter: 'firebase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'password', label: 'Email/Password' }
  ],
  env: {
    apiKey: 'PUBLIC_FIREBASE_API_KEY',
    authDomain: 'PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'PUBLIC_FIREBASE_PROJECT_ID'
  }
}`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Firebase Adapter</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Authenticate users using Firebase Auth with OAuth and password-based authentication.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/firebase</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Configuration</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{configCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Supported Providers</h2>
		<ul class="space-y-2">
			<li><strong>OAuth:</strong> Google, Facebook, Twitter, Apple, GitHub</li>
			<li><strong>Password:</strong> Email/Password, Phone</li>
		</ul>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/adapters/supabase" class="text-primary hover:underline">Supabase Adapter</a></li>
			<li><a href="/docs/adapters/auth0" class="text-primary hover:underline">Auth0 Adapter</a></li>
		</ul>
	</section>
</div>
