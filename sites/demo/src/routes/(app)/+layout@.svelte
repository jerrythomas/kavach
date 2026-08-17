<script>
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import DensitySwitcherToggle from '$lib/components/DensitySwitcherToggle.svelte'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'
	import { env } from '$env/dynamic/public'
	import { mountKavach } from '$lib/client-kavach.js'
	import {
		DemoNavItem,
		RoleCard,
		SentryConfigPanel,
		HackerToggle,
		FloatingBadge,
		ADAPTERS,
		ROUTES,
		ROUTE_ACCESS,
		RULES,
		COPY,
		isLive
	} from 'showcase-kavach'

	let { children, data } = $props()

	const kavach = $state({})
	setContext('kavach', kavach)

	onMount(async () => {
		const { instance } = await mountKavach()
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
	})

	const user = $derived(data?.user ?? null)
	const role = $derived(user?.role ?? null)
	const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapter = $derived(ADAPTERS[adapterId] ?? { label: adapterId })

	const routeAccess = $derived(
		ROUTE_ACCESS.map((r) => (r.roles.includes('admin') ? { ...r, allowed: role === 'admin' } : r))
	)

	const sentryRules = $derived(
		RULES.map((r) => {
			const roles = r.public ? 'public' : r.roles
			const allowed =
				r.public || r.roles === '*'
					? true
					: Array.isArray(r.roles)
						? r.roles.includes(role ?? '')
						: false
			return { path: r.path, roles, allowed }
		})
	)
</script>

<div class="bg-paper text-ink flex h-screen flex-col overflow-hidden">
	<!-- Top bar -->
	<header
		class="border-paper-edge bg-paper-soft px-gutter flex h-14 shrink-0 items-center border-b"
	>
		<div class="flex items-center gap-2">
			<span class="text-ink font-bold">{COPY.demo.appName}</span>
			<span class="text-ink-faint">·</span>
			<span class="text-ink-mute text-sm">{adapter.label}</span>
		</div>
		<div class="flex-1"></div>
		<div class="flex items-center gap-3">
			<ThemeSwitcherToggle />
			<DensitySwitcherToggle />
			{#if user}
				<div class="flex items-center gap-2">
					<div
						class="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
					>
						{user.email?.[0]?.toUpperCase() ?? '?'}
					</div>
					<div class="hidden flex-col text-right sm:flex">
						<span class="text-ink text-xs font-medium">{user.email}</span>
						<span class="font-mono text-xs {role === 'admin' ? 'text-warning' : 'text-primary'}">
							{role ?? 'authenticated'}
						</span>
					</div>
				</div>
			{/if}
		</div>
	</header>

	<!-- Body -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar -->
		<aside
			class="border-paper-edge bg-paper-soft flex w-52 shrink-0 flex-col overflow-y-auto border-r"
		>
			<nav class="flex flex-col gap-1 p-3">
				<DemoNavItem href={ROUTES.home} label={COPY.demo.sidebar.dashboard} icon="i-app-list" />
				<DemoNavItem href={ROUTES.data} label={COPY.demo.sidebar.data} icon="i-app-list" />
				<DemoNavItem
					href="/admin"
					label={COPY.demo.sidebar.admin}
					icon="i-app-shield"
					locked={role !== 'admin'}
				/>
				<DemoNavItem href={ROUTES.logout} label={COPY.demo.sidebar.signOut} icon="i-app-logout" />
			</nav>

			<div class="border-paper-edge border-t p-3">
				<RoleCard {role} routes={routeAccess} />
			</div>

			<div class="border-paper-edge border-t p-3">
				<SentryConfigPanel rules={sentryRules} />
			</div>

			<div class="border-paper-edge border-t p-3">
				<span class="text-ink-faint mb-1.5 block text-xs font-semibold tracking-wide uppercase">
					{COPY.demo.otherAdapters}
				</span>
				<div class="flex flex-col gap-1">
					{#each Object.entries(ADAPTERS) as [id, a] (id)}
						{#if id !== adapterId}
							{#if a.demoUrl && isLive(id)}
								<a
									href={a.demoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-ink-mute hover:text-ink text-xs transition-colors"
								>
									{a.label} →
								</a>
							{:else}
								<span class="text-ink-faint cursor-default text-xs">
									{a.label} · {COPY.demo.comingSoon}
								</span>
							{/if}
						{/if}
					{/each}
				</div>
			</div>

			<div class="border-paper-edge mt-auto border-t p-3">
				<HackerToggle />
			</div>
		</aside>

		<!-- Main -->
		<main class="p-card flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>

<FloatingBadge {adapterId} adapterLabel={adapter.label} />
