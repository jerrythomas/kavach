<script>
	import { Button, Code } from '@rokkit/ui'
	import { PLATFORMS } from '$lib/demo/platforms'
	import FloatingCircles from '$lib/FloatingCircles.svelte'

	const features = [
		{ icon: 'i-app-shield', label: 'Role-based route protection' },
		{ icon: 'i-app-login', label: 'Server-side session cookie' },
		{ icon: 'i-app-list', label: 'Cached login history' },
		{ icon: 'i-app-code-visible', label: 'Pre-built UI components' }
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

<main class="text-surface-z9 flex flex-col">
	<!-- Padded content area -->
	<div class="mx-auto flex w-full max-w-4xl flex-col items-center px-8 pt-16 pb-12">
		<!-- Hero -->
		<div class="mb-16 w-full space-y-6 text-center">
			<h1 class="text-surface-z9 flex w-full items-center justify-center gap-3">
				<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-14 w-14" />
				Kavach
			</h1>
			<p class="text-surface-z6 mx-auto max-w-lg text-lg">
				Drop-in authentication for SvelteKit. One unified API, declarative route protection, and
				pre-built UI components — across every platform.
			</p>
			<div class="flex justify-center gap-3 pt-2">
				<Button href="/docs/quick-start" variant="primary" size="lg">Get Started</Button>
				<Button href="https://github.com/jerrythomas/kavach" style="outline" size="lg"
					>GitHub</Button
				>
			</div>

			<div class="flex w-full flex-col gap-3 sm:flex-row">
				<!-- Platforms card -->
				<div
					class="border-surface-z3 bg-surface-z1 flex flex-1 flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm"
				>
					<p class="section-label text-surface-z5">Works with</p>
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
					<p class="section-label text-surface-z5">Quick start</p>
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
		<div class="border-primary/20 bg-primary/5 mb-12 w-full rounded-2xl border px-6 py-5">
			<p class="section-label text-primary">What Kavach provides with any platform</p>
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
		<div class="w-full">
			<p class="section-label text-surface-z5">Choose your platform</p>
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
							<h3 class="text-surface-z9 group-hover:text-primary mb-0.5 transition-colors">
								{platform.name}
							</h3>
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
	</div>

	<!-- Browse the docs — full width -->
	<div class="bg-surface-z2/80 w-full py-12">
		<div class="mx-auto max-w-4xl px-8">
			<h2 class="text-surface-z9 mb-5">Browse the docs</h2>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each docsSections as s (s.href)}
					<a
						href={s.href}
						class="border-surface-z3 bg-surface-z0 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<span class="{s.icon} text-primary h-6 w-6"></span>
						<div>
							<h3 class="text-surface-z9">{s.label}</h3>
							<p class="text-surface-z5 mt-0.5 text-xs leading-relaxed">{s.desc}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- CTA — full width with floating circles -->
	<div class="cta-section relative w-full overflow-hidden py-16 text-center">
		<FloatingCircles count={7} minSize={10} maxSize={68} />
		<div class="relative z-10 mx-auto max-w-4xl px-8">
			<h2 class="mb-3 text-white">Ready to get started?</h2>
			<p class="mx-auto mb-8 max-w-md text-sm text-white/70">
				Drop authentication into your SvelteKit app in minutes. One unified API for every platform.
			</p>
			<div class="flex justify-center gap-4">
				<a
					href="/docs/quick-start"
					class="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-teal-700 transition-colors hover:bg-white/90"
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
	</div>

	<!-- Footer — full width -->
	<footer class="page-footer w-full py-8">
		<div class="mx-auto max-w-4xl px-8">
			<div class="grid grid-cols-2 gap-6 sm:grid-cols-6">
				<!-- Brand -->
				<div class="col-span-2 space-y-2">
					<div class="flex items-center gap-2.5">
						<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-8 w-8 opacity-70" />
						<span class="text-base font-bold text-white">Kavach</span>
					</div>
					<p class="text-xs leading-relaxed text-white/40">Auth for SvelteKit.</p>
					<hr class="border-white/10" />
					<p class="text-xs text-white/30">© 2025 Kavach. MIT Licensed.</p>
				</div>
				<!-- Start -->
				<div class="space-y-2">
					<p class="footer-label">Start</p>
					<ul class="space-y-1.5">
						<li><a href="/docs/quick-start" class="footer-link">Quick Start</a></li>
						<li><a href="/docs/adapters" class="footer-link">Adapters</a></li>
					</ul>
				</div>
				<!-- Configure -->
				<div class="space-y-2">
					<p class="footer-label">Configure</p>
					<ul class="space-y-1.5">
						<li><a href="/docs/configuration" class="footer-link">Configuration</a></li>
						<li><a href="/docs/sentry" class="footer-link">Sentry</a></li>
					</ul>
				</div>
				<!-- Tools -->
				<div class="space-y-2">
					<p class="footer-label">Tools</p>
					<ul class="space-y-1.5">
						<li><a href="/docs/cli" class="footer-link">CLI</a></li>
						<li><a href="/docs/components" class="footer-link">UI Components</a></li>
					</ul>
				</div>
				<!-- Resources -->
				<div class="space-y-2">
					<p class="footer-label">Resources</p>
					<ul class="space-y-1.5">
						<li><a href="https://github.com/jerrythomas/kavach" class="footer-link">GitHub</a></li>
						<li><a href="/llms/llms.txt" class="footer-link">llms.txt</a></li>
					</ul>
				</div>
			</div>
		</div>
	</footer>
</main>

<style>
	/* Heading scale — size and weight defined once */
	h1 {
		font-size: 3rem;
		font-weight: 900;
		letter-spacing: -0.025em;
		line-height: 1.1;
	}
	h2 {
		font-size: 1.75rem;
		font-weight: 800;
		line-height: 1.25;
	}
	h3 {
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.4;
	}
	/* Eyebrow labels above sections */
	:global(.section-label) {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 1.25rem;
	}
	/* Footer column labels and links */
	:global(.footer-label) {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.4);
	}
	:global(.footer-link) {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		transition: color 0.15s;
	}
	:global(.footer-link:hover) {
		color: white;
	}
	/* CTA gradient */
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
		background: linear-gradient(
			135deg,
			rgba(13, 148, 136, 0.8),
			rgba(14, 165, 233, 0.8),
			rgba(13, 148, 136, 0.8)
		);
		background-size: 200% 200%;
		animation: gradient-shift 6s ease infinite;
	}
	.page-footer {
		background: rgba(15, 23, 42, 0.8);
	}
</style>
