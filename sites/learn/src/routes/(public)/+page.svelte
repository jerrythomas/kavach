<script>
	import { Button, Code } from '@rokkit/ui'
	import { PLATFORMS } from '$lib/demo/platforms'

	const features = [
		{ icon: 'i-app-shield', label: 'Role-based route protection' },
		{ icon: 'i-app-login', label: 'Server-side session cookie' },
		{ icon: 'i-app-list', label: 'Cached login history' },
		{ icon: 'i-app-code-visible', label: 'Pre-built UI components' }
	]

	const footerDocs = [
		{ label: 'Quick Start', href: '/docs/quick-start' },
		{ label: 'Adapters', href: '/docs/adapters' },
		{ label: 'Configuration', href: '/docs/configuration' },
		{ label: 'Sentry', href: '/docs/sentry' },
		{ label: 'CLI', href: '/docs/cli' }
	]

	const docsSections = [
		{
			label: 'Getting Started',
			icon: 'i-app-login',
			href: '/docs/quick-start',
			desc: 'Install, scaffold, and go live in minutes'
		},
		{
			label: 'Adapters',
			icon: 'i-auth-supabase',
			href: '/docs/adapters',
			desc: 'Supabase, Firebase, Convex, Auth0, Amplify'
		},
		{
			label: 'Configuration',
			icon: 'i-app-list',
			href: '/docs/configuration',
			desc: 'Routes, roles, sessions, and redirects'
		},
		{
			label: 'UI Components',
			icon: 'i-app-code-visible',
			href: '/docs/components',
			desc: 'AuthPage, LoginCard, AuthButton, and more'
		},
		{
			label: 'Sentry',
			icon: 'i-app-shield',
			href: '/docs/sentry',
			desc: 'Declarative route protection rules'
		},
		{
			label: 'CLI',
			icon: 'i-app-code-hidden',
			href: '/docs/cli',
			desc: 'Doctor, init, and scaffold commands'
		}
	]
</script>

<main class="text-surface-z9 flex flex-col items-center px-8 py-16">
	<!-- Hero -->
	<div class="mx-auto mb-16 max-w-2xl space-y-6 text-center">
		<h1
			class="text-surface-z9 flex w-full items-center justify-center gap-3 text-5xl font-black tracking-tight"
		>
			<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-14 w-14" />
			Kavach
		</h1>
		<p class="text-surface-z6 mx-auto max-w-lg text-lg">
			Drop-in authentication for SvelteKit. One unified API, declarative route protection, and
			pre-built UI components — across every platform.
		</p>
		<div class="flex justify-center gap-3 pt-2">
			<Button href="/docs/quick-start" variant="primary" size="lg">Get Started</Button>
			<Button href="https://github.com/jerrythomas/kavach" style="outline" size="lg">GitHub</Button>
		</div>

		<div class="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
			<!-- Platforms card -->
			<div
				class="border-surface-z3 bg-surface-z1 flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm"
			>
				<p class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Works with</p>
				<div class="flex flex-wrap items-center gap-3">
					{#each PLATFORMS as platform (platform.id)}
						<a
							href="/docs/adapters/{platform.id}"
							title={platform.name}
							class="border-surface-z3 bg-surface-z2 hover:border-primary flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
						>
							<span class="{platform.icon} h-6 w-6" aria-hidden="true"></span>
						</a>
					{/each}
				</div>
				<p class="text-surface-z5 text-xs">{PLATFORMS.map((p) => p.name).join(' · ')}</p>
			</div>
			<!-- Quick start card -->
			<div
				class="border-surface-z3 bg-surface-z1 flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm"
			>
				<p class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Quick start</p>
				<div
					class="border-surface-z2 bg-surface-z2 overflow-hidden rounded-md border [&_pre]:!py-2"
				>
					<Code code="bunx @kavach/cli init" language="bash" />
				</div>
				<p class="text-surface-z5 text-xs">Scaffold auth into any SvelteKit app in seconds</p>
			</div>
		</div>
	</div>

	<!-- What Kavach provides -->
	<div class="border-primary/20 bg-primary/5 mb-12 w-full max-w-4xl rounded-2xl border px-6 py-5">
		<p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
			What Kavach provides with any platform
		</p>
		<div class="flex flex-wrap gap-5">
			{#each features as feature (feature.icon)}
				<div class="flex items-center gap-2 text-sm">
					<span class="{feature.icon} text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
					<span class="text-surface-z8">{feature.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Adapter grid -->
	<div class="w-full max-w-4xl">
		<p class="text-surface-z5 mb-5 text-xs font-semibold tracking-wider uppercase">
			Choose your platform
		</p>
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each PLATFORMS as platform (platform.id)}
				<a
					href="/docs/adapters/{platform.id}"
					class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
				>
					<div class="flex items-start justify-between">
						<div class="bg-surface-z2 flex h-14 w-14 items-center justify-center rounded-xl">
							<span class="{platform.icon} h-9 w-9" aria-hidden="true"></span>
						</div>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
								? 'bg-success-100 text-success-700'
								: 'bg-surface-z3 text-surface-z5'}"
						>
							{platform.live ? 'LIVE' : 'WIP'}
						</span>
					</div>

					<div>
						<h2
							class="text-surface-z9 group-hover:text-primary mb-0.5 text-lg font-bold transition-colors"
						>
							{platform.name}
						</h2>
						<p class="text-surface-z6 text-sm">{platform.description}</p>
					</div>

					<ul class="flex flex-col gap-1.5">
						{#each platform.capabilities as cap}
							<li class="flex items-center gap-2 text-sm">
								<span class="i-app-shield text-primary/40 h-3 w-3 shrink-0" aria-hidden="true"
								></span>
								<span class="text-surface-z6">{cap}</span>
							</li>
						{/each}
					</ul>
				</a>
			{/each}
		</div>
	</div>

	<!-- Browse the docs -->
	<div class="border-surface-z3 bg-surface-z1 mt-16 w-full max-w-4xl rounded-2xl border px-8 py-8">
		<h2 class="text-surface-z9 mb-5 text-lg font-bold">Browse the docs</h2>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each docsSections as s (s.href)}
				<a
					href={s.href}
					class="border-surface-z3 bg-surface-z0 hover:border-primary flex flex-col items-start gap-3 rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<span class="{s.icon} text-primary h-6 w-6"></span>
					<div>
						<p class="text-surface-z9 font-semibold">{s.label}</p>
						<p class="text-surface-z5 mt-0.5 text-xs leading-relaxed">{s.desc}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- CTA -->
	<div class="cta-section mt-8 w-full max-w-4xl rounded-3xl px-8 py-14 text-center">
		<h2 class="mb-3 text-2xl font-black text-white">Ready to get started?</h2>
		<p class="mx-auto mb-8 max-w-md text-sm text-white/70">
			Drop authentication into your SvelteKit app in minutes. One unified API for every platform.
		</p>
		<div class="flex justify-center gap-4">
			<a
				href="/docs/quick-start"
				class="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-indigo-700 transition-colors hover:bg-white/90"
			>
				Get Started
			</a>
			<a
				href="https://github.com/jerrythomas/kavach"
				class="rounded-xl border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
			>
				GitHub
			</a>
		</div>
	</div>

	<!-- Page footer links -->
	<div class="page-footer mt-8 w-full max-w-4xl rounded-2xl px-8 py-10">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-5 w-5 opacity-60" />
					<span class="font-bold text-white">Kavach</span>
				</div>
				<p class="text-xs leading-relaxed text-white/50">
					Authentication made simple for SvelteKit apps.
				</p>
			</div>
			<div class="space-y-3">
				<p class="text-xs font-semibold tracking-wider text-white/40 uppercase">Documentation</p>
				<ul class="space-y-2">
					{#each footerDocs as link (link.href)}
						<li>
							<a href={link.href} class="text-xs text-white/60 transition-colors hover:text-white">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div class="space-y-3">
				<p class="text-xs font-semibold tracking-wider text-white/40 uppercase">Resources</p>
				<ul class="space-y-2">
					<li>
						<a
							href="https://github.com/jerrythomas/kavach"
							class="text-xs text-white/60 transition-colors hover:text-white"
						>
							GitHub
						</a>
					</li>
					<li>
						<a
							href="/llms/llms.txt"
							class="text-xs text-white/60 transition-colors hover:text-white"
						>
							llms.txt
						</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="mt-8 border-t border-white/10 pt-6">
			<p class="text-xs text-white/30">© 2025 Kavach. MIT Licensed.</p>
		</div>
	</div>
</main>

<style>
	@keyframes gradient-shift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
	.cta-section {
		background: linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5);
		background-size: 200% 200%;
		animation: gradient-shift 6s ease infinite;
	}
	.page-footer {
		background: #0f172a;
	}
</style>
