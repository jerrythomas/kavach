<script>
	const usage = `<script>
  import { LoginCard } from '@kavach/ui'
<\/script>

<LoginCard 
  email="user@example.com"
  name="John Doe"
  avatar="https://..."
  provider="google"
  mode="oauth"
  hasPasskey={false}
  onclick={(data) => {
    // Re-authenticate
    signIn(data.email, data.provider)
  }}
  onremove={(email) => {
    // Remove from cache
    removeCachedLogin(email)
  }}
/>`

	const list = `<script>
  import { LoginCardList } from '@kavach/ui'
<\/script>

<LoginCardList 
  logins={cachedLogins}
  onclick={handleLogin}
  onremove={handleRemove}
/>`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">LoginCard</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Display cached login entries with quick re-authentication.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">LoginCard</h2>
		<p class="mb-4">Single cached login entry:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{usage}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">LoginCardList</h2>
		<p class="mb-4">Render multiple login cards:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{list}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Features</h2>
		<ul class="space-y-2">
			<li><strong>Avatar Display</strong> — Shows user avatar or initials</li>
			<li><strong>Provider Badge</strong> — Icon showing auth provider</li>
			<li><strong>Passkey Icon</strong> — Shows passkey icon if available</li>
			<li><strong>Quick Remove</strong> — Remove button to clear from cache</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Props (LoginCard)</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-surface-z3">
						<th class="py-2">Prop</th>
						<th class="py-2">Type</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-surface-z3">
						<td class="py-2">email</td>
						<td class="py-2">string</td>
						<td class="py-2">User email</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">name</td>
						<td class="py-2">string</td>
						<td class="py-2">Display name</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">avatar</td>
						<td class="py-2">string</td>
						<td class="py-2">Avatar URL</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">provider</td>
						<td class="py-2">string</td>
						<td class="py-2">Auth provider name</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">mode</td>
						<td class="py-2">string</td>
						<td class="py-2">oauth, password, otp, passkey</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">hasPasskey</td>
						<td class="py-2">boolean</td>
						<td class="py-2">Passkey available</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">onclick</td>
						<td class="py-2">function</td>
						<td class="py-2">Card click handler</td>
					</tr>
					<tr>
						<td class="py-2">onremove</td>
						<td class="py-2">function</td>
						<td class="py-2">Remove button handler</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/components/auth-page" class="text-primary hover:underline">AuthPage</a></li>
			<li><a href="/docs/authentication" class="text-primary hover:underline">Authentication</a></li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Quick Start</a></li>
		</ul>
	</section>
</div>
