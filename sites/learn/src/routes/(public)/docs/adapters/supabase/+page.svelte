<script>
	import { Code } from '@rokkit/ui'
	const supabaseConfig = `export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'github', label: 'Continue with GitHub' }
  ],
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  }
}`

	const providers = [
		{ icon: 'i-auth-google', label: 'Google' },
		{ icon: 'i-auth-github', label: 'GitHub' },
		{ icon: 'i-auth-facebook', label: 'Facebook' },
		{ icon: 'i-auth-apple', label: 'Apple' },
		{ icon: 'i-auth-twitter', label: 'Twitter' },
		{ icon: 'i-auth-email', label: 'Email + Password' },
		{ icon: 'i-auth-magic', label: 'Magic Link' },
		{ icon: 'i-auth-passkey', label: 'Passkey' }
	]

	const capabilities = [
		'Authentication',
		'Data API (PostgREST)',
		'RPC functions',
		'Row-level security',
		'Magic link / OTP',
		'WebAuthn passkeys',
		'Structured logging'
	]
</script>

<div class="max-w-4xl space-y-8">
	<!-- Hero banner -->
	<div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-7 py-6">
		<div class="flex items-center gap-5">
			<div
				class="bg-opacity-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500"
			>
				<span class="i-auth-supabase h-9 w-9" aria-hidden="true"></span>
			</div>
			<div class="flex-1">
				<div class="mb-1 flex items-center gap-3">
					<h1 class="text-surface-z9 text-2xl font-extrabold tracking-tight">Supabase Adapter</h1>
					<span
						class="bg-success-100 text-success-700 rounded-full px-2.5 py-0.5 text-xs font-bold"
					>
						LIVE
					</span>
				</div>
				<p class="text-surface-z6 text-sm">
					Postgres-powered auth with row-level security. Email/password, magic link, OAuth
					providers, and WebAuthn passkeys.
				</p>
				<div class="mt-3 flex items-center gap-3">
					<span
						class="bg-surface-z1 border-surface-z3 text-surface-z6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs"
					>
						<span class="i-app-code-visible h-3 w-3"></span>
						@kavach/adapter-supabase
					</span>
					<a
						href="/demo/supabase"
						class="bg-primary text-on-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold transition-opacity hover:opacity-90"
					>
						<span class="i-app-login h-3 w-3"></span>
						Try Demo
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Installation -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Installation</h2>
		<Code code={`npm install @kavach/adapter-supabase`} language="bash" />
	</section>

	<!-- Configuration -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Configuration</h2>
		<Code code={supabaseConfig} language="js" />
	</section>

	<!-- Environment Variables -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Environment Variables</h2>
		<div class="border-surface-z3 overflow-hidden rounded-xl border">
			<table class="w-full border-collapse">
				<thead>
					<tr class="bg-surface-z2">
						<th class="text-surface-z5 p-3 text-left text-xs font-semibold tracking-wider uppercase"
							>Variable</th
						>
						<th class="text-surface-z5 p-3 text-left text-xs font-semibold tracking-wider uppercase"
							>Description</th
						>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-t">
						<td class="p-3"
							><code class="bg-surface-z2 text-surface-z8 rounded px-2 py-0.5 font-mono text-xs"
								>PUBLIC_SUPABASE_URL</code
							></td
						>
						<td class="text-surface-z6 p-3 text-sm">Your Supabase project URL</td>
					</tr>
					<tr class="border-surface-z3 border-t">
						<td class="p-3"
							><code class="bg-surface-z2 text-surface-z8 rounded px-2 py-0.5 font-mono text-xs"
								>PUBLIC_SUPABASE_ANON_KEY</code
							></td
						>
						<td class="text-surface-z6 p-3 text-sm">Your Supabase anon (public) key</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Supported Providers -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Supported Providers</h2>
		<div class="flex flex-wrap gap-2">
			{#each providers as p}
				<div
					class="border-surface-z3 bg-surface-z1 flex items-center gap-2 rounded-lg border px-3 py-2"
				>
					<span class="{p.icon} h-4 w-4 shrink-0" aria-hidden="true"></span>
					<span class="text-surface-z7 text-sm font-medium">{p.label}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Capabilities -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Capabilities</h2>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each capabilities as cap}
				<div
					class="border-surface-z3 bg-surface-z1 flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
				>
					<span class="i-app-shield text-success-600 h-3.5 w-3.5 shrink-0" aria-hidden="true"
					></span>
					<span class="text-surface-z7 text-sm">{cap}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Next Steps -->
	<section class="space-y-3">
		<h2 class="text-surface-z9 text-lg font-bold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/configuration" class="text-primary text-sm hover:underline"
					>Configure more providers →</a
				>
			</li>
			<li>
				<a href="/docs/quick-start" class="text-primary text-sm hover:underline"
					>Back to Quick Start →</a
				>
			</li>
		</ul>
	</section>
</div>
