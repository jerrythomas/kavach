<script lang="ts">
	import { DOCS_NAV } from '$lib/mockups/nav-data'
	import CalloutBlock from '$lib/mockups/CalloutBlock.svelte'
	import { Code } from '@rokkit/ui'

	// Simulate active page
	let active = $state('/docs/quick-start')

	const tocItems = [
		{ label: 'Prerequisites', id: 'prerequisites' },
		{ label: 'Installation', id: 'installation' },
		{ label: 'Scaffold auth', id: 'scaffold' },
		{ label: 'Configure routes', id: 'configure' },
		{ label: 'Run your app', id: 'run' }
	]
	let activeToc = $state('prerequisites')
</script>

<div class="text-surface-z8 flex h-full">
	<!-- Sidebar -->
	<aside
		class="border-surface-z3 bg-surface-z1 flex w-72 shrink-0 flex-col overflow-y-auto border-r"
	>
		<!-- Search -->
		<div class="border-surface-z3 border-b p-4">
			<div
				class="border-surface-z4 bg-surface-z2 text-surface-z5 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
			>
				<span class="i-app-code-visible h-4 w-4"></span>
				Search docs…
				<span class="border-surface-z4 ml-auto rounded border px-1 font-mono text-xs">⌘K</span>
			</div>
		</div>

		<!-- Nav -->
		<nav class="flex-1 p-4">
			{#each DOCS_NAV as item (item.value)}
				{#if item.children}
					<!-- Group -->
					<div class="mb-1">
						<p
							class="text-surface-z5 mt-3 mb-1 px-2 text-xs font-semibold tracking-wider uppercase"
						>
							{item.label}
						</p>
						{#each item.children as child (child.value)}
							<button
								onclick={() => (active = child.value)}
								class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
								class:bg-primary={active === child.value}
								class:text-on-primary={active === child.value}
								class:text-surface-z7={active !== child.value}
								class:hover:bg-surface-z2={active !== child.value}
							>
								{#if child.icon}
									<span class="{child.icon} h-4 w-4 shrink-0"></span>
								{/if}
								{child.label}
							</button>
						{/each}
					</div>
				{:else}
					<button
						onclick={() => (active = item.value)}
						class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
						class:bg-primary={active === item.value}
						class:text-on-primary={active === item.value}
						class:text-surface-z7={active !== item.value}
						class:hover:bg-surface-z2={active !== item.value}
					>
						{#if item.icon}
							<span class="{item.icon} h-4 w-4 shrink-0"></span>
						{/if}
						{item.label}
					</button>
				{/if}
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<main class="min-w-0 flex-1 overflow-y-auto px-12 py-10">
		<!-- Breadcrumb -->
		<nav class="text-surface-z5 mb-6 flex items-center gap-2 text-xs">
			<a href="/mockups/learn-a" class="hover:text-primary">Docs</a>
			<span>›</span>
			<span class="text-surface-z7">Quick Start</span>
		</nav>

		<h1 class="text-surface-z9 mb-2 text-4xl font-black tracking-tight">Quick Start</h1>
		<p class="text-surface-z6 mb-8 text-lg">
			Get Kavach running in your SvelteKit app in under 5 minutes.
		</p>

		<h2 id="prerequisites" class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Prerequisites</h2>
		<p class="text-surface-z7 mb-4 leading-relaxed">
			You need a SvelteKit project and one of the supported auth providers (Supabase, Firebase,
			Convex, Auth0, or Amplify).
		</p>

		<CalloutBlock type="tip" title="New to SvelteKit?">
			Run <code class="bg-surface-z2 rounded px-1 font-mono text-sm"
				>npm create svelte@latest my-app</code
			> to scaffold a fresh project before continuing.
		</CalloutBlock>

		<h2 id="installation" class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Installation</h2>
		<p class="text-surface-z7 mb-3 leading-relaxed">
			Install the Kavach CLI, which will scaffold everything you need:
		</p>
		<div
			class="border-surface-z3 bg-surface-z2 mb-4 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
		>
			<Code code="bunx @kavach/cli init" language="bash" />
		</div>

		<h2 id="scaffold" class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Scaffold auth</h2>
		<p class="text-surface-z7 mb-3 leading-relaxed">
			The CLI will ask which adapter to use and generate the right config, hooks, and route files.
		</p>
		<div
			class="border-surface-z3 bg-surface-z2 mb-4 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
		>
			<Code
				code={`? Which auth provider? › Supabase
✔ Created src/lib/kavach/auth.ts
✔ Created src/hooks.server.ts
✔ Created src/routes/auth/+page.svelte
✔ Created src/routes/(app)/+layout.server.ts`}
				language="bash"
			/>
		</div>

		<CalloutBlock type="note">
			The CLI adds <code class="bg-surface-z2 rounded px-1 font-mono text-xs">@kavach/vite</code> to your
			Vite config automatically. No manual plugin registration needed.
		</CalloutBlock>

		<h2 id="configure" class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Configure routes</h2>
		<p class="text-surface-z7 mb-3 leading-relaxed">
			Edit the generated sentry config to declare which routes require auth and what roles they
			need:
		</p>
		<div
			class="border-surface-z3 bg-surface-z2 mb-4 overflow-hidden rounded-xl border [&_pre]:!px-5 [&_pre]:!py-4"
		>
			<Code
				code={`// src/lib/kavach/sentry.ts
export const rules = [
  { path: '/dashboard', roles: '*' },
  { path: '/admin',     roles: ['admin'] },
  { path: '/api/admin-stats', roles: ['admin'] }
]`}
				language="typescript"
			/>
		</div>

		<h2 id="run" class="text-surface-z9 mt-8 mb-3 text-xl font-bold">Run your app</h2>
		<p class="text-surface-z7 mb-4 leading-relaxed">
			Start the dev server. Navigate to <code class="bg-surface-z2 rounded px-1 font-mono text-sm"
				>/auth</code
			> to see the login page, then sign in.
		</p>

		<CalloutBlock type="warning">
			Make sure your <code class="bg-surface-z2 rounded px-1 font-mono text-xs">.env</code> file has the
			correct provider credentials before starting. See the adapter docs for required variables.
		</CalloutBlock>

		<!-- Next steps -->
		<div class="border-surface-z3 bg-surface-z1 mt-10 rounded-2xl border p-6">
			<p class="text-surface-z9 mb-4 font-semibold">Next steps</p>
			<div class="grid gap-2 sm:grid-cols-2">
				{#each [{ label: 'Adapter reference', href: '#', desc: 'Configure your auth provider' }, { label: 'Route protection', href: '#', desc: 'Sentry rules deep dive' }, { label: 'UI Components', href: '#', desc: 'AuthPage, LoginCard, and more' }, { label: 'CLI reference', href: '#', desc: 'All doctor and scaffold commands' }] as link (link.label)}
					<a
						href={link.href}
						class="border-surface-z3 hover:border-primary flex flex-col gap-0.5 rounded-xl border p-3 transition-colors"
					>
						<span class="text-surface-z8 text-sm font-medium">{link.label}</span>
						<span class="text-surface-z5 text-xs">{link.desc}</span>
					</a>
				{/each}
			</div>
		</div>
	</main>

	<!-- Right TOC -->
	<aside class="border-surface-z3 hidden w-52 shrink-0 flex-col border-l px-5 py-8 xl:flex">
		<p class="text-surface-z5 mb-3 text-xs font-semibold tracking-wider uppercase">On this page</p>
		<nav class="flex flex-col gap-1">
			{#each tocItems as item (item.id)}
				<button
					onclick={() => (activeToc = item.id)}
					class="rounded px-2 py-1 text-left text-sm transition-colors"
					class:text-primary={activeToc === item.id}
					class:font-medium={activeToc === item.id}
					class:text-surface-z6={activeToc !== item.id}
					class:hover:text-surface-z8={activeToc !== item.id}
				>
					{item.label}
				</button>
			{/each}
		</nav>
	</aside>
</div>
