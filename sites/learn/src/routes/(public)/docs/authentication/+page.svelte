<script>
	const signInCode = `import { kavach } from '$kavach/auth'

// In your component
async function handleSignIn() {
  const result = await kavach.signIn({
    provider: 'google',
    redirectTo: '/dashboard'
  })
  
  if (result.type === 'success') {
    // User signed in
  }
}`

	const signUpCode = `const result = await kavach.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: '/auth/verify'
  }
})`

	const authFlows = `| Flow       | Description                          |
|------------|--------------------------------------|
| OAuth      | Social login (Google, GitHub, etc.)  |
| Magic Link | Passwordless via email               |
| Password   | Traditional email/password            |
| Passkey    | WebAuthn/FIDO2                       |`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Authentication</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Learn how Kavach handles user authentication across different providers.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Auth Flows</h2>
		<p class="mb-4">Kavach supports multiple authentication flows:</p>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Flow</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">OAuth</td>
						<td class="py-2">Social login (Google, GitHub, etc.)</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Magic Link</td>
						<td class="py-2">Passwordless via email</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">Password</td>
						<td class="py-2">Traditional email/password</td>
					</tr>
					<tr>
						<td class="py-2">Passkey</td>
						<td class="py-2">WebAuthn/FIDO2</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Sign In</h2>
		<p class="mb-4">Authenticate a user:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{signInCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Sign Up</h2>
		<p class="mb-4">Create a new user account:</p>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{signUpCode}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Sign Out</h2>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>await kavach.signOut()</code
			></pre>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/authorization" class="text-primary hover:underline"
					>Learn about authorization</a
				>
			</li>
			<li><a href="/docs/session" class="text-primary hover:underline">Session management</a></li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline"
					>Configure your adapter</a
				>
			</li>
		</ul>
	</section>
</div>
