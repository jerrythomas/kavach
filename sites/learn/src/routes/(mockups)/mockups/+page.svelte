<script lang="ts">
	const options = [
		{
			id: 'learn-a',
			label: 'Learn A — Sidebar editorial',
			desc: 'Wide sidebar with inline search, rich typography, callout blocks. Inspired by Linear Docs.',
			href: '/mockups/learn-a',
			tag: 'docs site',
			accent: 'bg-violet-500'
		},
		{
			id: 'learn-b',
			label: 'Learn B — Top-nav hub',
			desc: 'Top nav tabs switch context. Home is a category hub, not a platform grid. Inspired by Stripe Docs.',
			href: '/mockups/learn-b',
			tag: 'docs site',
			accent: 'bg-blue-500'
		},
		{
			id: 'learn-c',
			label: 'Learn C — Command palette',
			desc: 'Minimal chrome, ⌘K search as primary nav. Reading-first docs layout. Inspired by Zed Docs.',
			href: '/mockups/learn-c',
			tag: 'docs site',
			accent: 'bg-emerald-500'
		},
		{
			id: 'demo-a',
			label: 'Demo A — FitTrack (coach/athlete)',
			desc: 'Dark athletic theme. Coach vs athlete roles, hacker mode shows auth blocks. Fitness app.',
			href: '/mockups/demo-a',
			tag: 'demo app',
			accent: 'bg-cyan-500'
		},
		{
			id: 'demo-b',
			label: 'Demo B — GymOS (SaaS)',
			desc: 'Light professional SaaS. Member / trainer / admin tiers. Terminal-style hacker log.',
			href: '/mockups/demo-b',
			tag: 'demo app',
			accent: 'bg-indigo-500'
		}
	]
</script>

<div class="mx-auto max-w-4xl px-8 py-12">
	<h1 class="text-surface-z9 mb-2 text-3xl font-black">Design Mockups</h1>
	<p class="text-surface-z6 mb-10 text-sm">
		Five options across two tracks. Click any card to preview.
	</p>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each options as opt (opt.id)}
			<a
				href={opt.href}
				class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full {opt.accent}"></span>
					<span class="text-surface-z5 font-mono text-xs uppercase">{opt.tag}</span>
				</div>
				<p class="text-surface-z9 leading-snug font-semibold">{opt.label}</p>
				<p class="text-surface-z6 text-sm leading-relaxed">{opt.desc}</p>
				<span class="text-primary mt-auto text-xs font-medium">View mockup →</span>
			</a>
		{/each}
	</div>
</div>
