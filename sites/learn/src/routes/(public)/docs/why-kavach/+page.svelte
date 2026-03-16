<script>
	import { Code } from '@rokkit/ui'

	const swapCode = `// kavach.config.js — change one line to switch backends
export default {
  adapter: 'firebase',  // was 'supabase' — everything else stays the same
  providers: [...],
  rules: [...]
}`

	const flowCode = `kavach.config.js       adapter, providers, route rules, env var names
        ↓
@kavach/vite plugin    reads config, generates virtual module at build time
        ↓
$kavach/auth           exports: kavach (instance), adapter, logger
        ↓
kavach.handle          SvelteKit server hook — runs on every request
        ↓
sentry                 evaluates route rules against current session
        ↓
session cookie         httpOnly cookie stores access + refresh tokens
        ↓
event.locals.session   available in all load functions and server routes`

	const packages = [
		['kavach', 'Core client — createKavach, session sync, auth state'],
		['@kavach/vite', 'Vite plugin — generates $kavach/auth virtual module'],
		['@kavach/sentry', 'Route protection engine — rules, roles, redirect logic'],
		['@kavach/ui', 'Pre-built Svelte components — AuthPage, LoginCard, AuthButton'],
		['@kavach/logger', 'Structured audit logging with adapter support'],
		['@kavach/adapter-supabase', 'Supabase adapter (full capabilities)'],
		['@kavach/adapter-firebase', 'Firebase adapter'],
		['@kavach/adapter-auth0', 'Auth0 adapter'],
		['@kavach/adapter-amplify', 'AWS Amplify / Cognito adapter'],
		['@kavach/adapter-convex', 'Convex adapter']
	]
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Why Kavach</h1>
	<p class="text-surface-z7 mb-8 text-lg">
		Drop-in authentication for SvelteKit with a unified API across backends.
	</p>

	<h2 class="mt-8 mb-3 text-xl font-semibold">The Problem</h2>
	<p class="text-surface-z7 mb-4">
		Adding auth to a SvelteKit app typically means scattered authentication checks across route
		files, tight coupling to a specific backend, and manual session management in every load
		function. Switching auth providers means rewriting auth logic throughout your app.
	</p>

	<h2 class="mt-8 mb-3 text-xl font-semibold">The Adapter Model</h2>
	<p class="text-surface-z7 mb-4">
		Kavach provides one interface for auth regardless of backend. Configure your adapter once in
		<code>kavach.config.js</code> — your route protection rules, session handling, and UI components stay
		the same when you swap backends.
	</p>
	<Code code={swapCode} language="js" />

	<h2 class="mt-8 mb-3 text-xl font-semibold">How It Works</h2>
	<p class="text-surface-z7 mb-4">
		The <code>@kavach/vite</code> plugin reads your config at build time and generates the
		<code>$kavach/auth</code> virtual module. You register <code>kavach.handle</code> as a SvelteKit hook
		— from that point, every request is protected according to your route rules.
	</p>
	<Code code={flowCode} language="text" />

	<h2 class="mt-8 mb-3 text-xl font-semibold">Key Packages</h2>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="py-2 pr-4">Package</th>
					<th class="py-2">Purpose</th>
				</tr>
			</thead>
			<tbody>
				{#each packages as [pkg, desc]}
					<tr class="border-surface-z3 border-b">
						<td class="py-2 pr-4"><code>{pkg}</code></td>
						<td class="text-surface-z6 py-2">{desc}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h2 class="mt-8 mb-3 text-xl font-semibold">Next Steps</h2>
	<ul class="space-y-2">
		<li>
			<a href="/docs/quick-start" class="text-primary hover:underline"
				>Quick Start — get running in minutes</a
			>
		</li>
		<li><a href="/docs/cli" class="text-primary hover:underline">CLI reference</a></li>
		<li>
			<a href="/docs/core-concepts" class="text-primary hover:underline">Core concepts in depth</a>
		</li>
	</ul>
</div>
