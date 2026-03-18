<script>
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'
	import { env } from '$env/dynamic/public'
	import DemoNavItem from '$lib/DemoNavItem.svelte'
	import RoleCard from '$lib/RoleCard.svelte'
	import SentryConfigPanel from '$lib/SentryConfigPanel.svelte'
	import HackerToggle from '$lib/HackerToggle.svelte'
	import FloatingBadge from '$lib/FloatingBadge.svelte'

	let { children, data } = $props()

	const kavach = $state({})
	setContext('kavach', kavach)

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter: authAdapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')
		const instance = createKavach(authAdapter, { logger, invalidateAll })
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
	})

	const user = $derived(data?.user ?? null)
	const role = $derived(user?.role ?? null)
	const adapterId = env.PUBLIC_KAVACH_ADAPTER ?? 'supabase'
	const adapterLabel =
		{ supabase: 'Supabase', firebase: 'Firebase', convex: 'Convex' }[adapterId] ?? adapterId

	const routeAccess = $derived([
		{ path: '/dashboard', roles: '*', allowed: true },
		{ path: '/data', roles: '*', allowed: true },
		{ path: '/admin', roles: ['admin'], allowed: role === 'admin' }
	])

	const sentryRules = $derived([
		{ path: '/', roles: 'public', allowed: true },
		{ path: '/auth', roles: 'public', allowed: true },
		{ path: '/dashboard', roles: '*', allowed: true },
		{ path: '/data', roles: '*', allowed: true },
		{ path: '/admin', roles: ['admin'], allowed: role === 'admin' },
		{ path: '/data/facts', roles: '*', allowed: true },
		{ path: '/data/admin-stats', roles: ['admin'], allowed: role === 'admin' }
	])
</script>

<div class="bg-surface-z0 text-surface-z9 flex h-screen flex-col overflow-hidden">
	<!-- Top bar -->
	<header class="border-surface-z2 bg-surface-z1 flex h-14 shrink-0 items-center border-b px-4">
		<div class="flex items-center gap-2">
			<span class="text-surface-z9 font-bold">DemoApp</span>
			<span class="text-surface-z3">·</span>
			<span class="text-surface-z6 text-sm">{adapterLabel}</span>
		</div>
		<div class="flex-1"></div>
		<div class="flex items-center gap-3">
			<ThemeSwitcherToggle />
			{#if user}
				<div class="flex items-center gap-2">
					<div
						class="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
					>
						{user.email?.[0]?.toUpperCase() ?? '?'}
					</div>
					<div class="hidden flex-col text-right sm:flex">
						<span class="text-surface-z8 text-xs font-medium">{user.email}</span>
						<span
							class="font-mono text-xs {role === 'admin' ? 'text-warning-600' : 'text-primary'}"
						>
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
			class="border-surface-z2 bg-surface-z1 flex w-52 shrink-0 flex-col overflow-y-auto border-r"
		>
			<nav class="flex flex-col gap-1 p-3">
				<DemoNavItem href="/dashboard" label="Dashboard" icon="i-app-list" />
				<DemoNavItem href="/data" label="Space Facts" icon="i-app-list" />
				<DemoNavItem
					href="/admin"
					label="Admin Panel"
					icon="i-app-shield"
					locked={role !== 'admin'}
				/>
				<DemoNavItem href="/logout" label="Sign Out" icon="i-app-logout" />
			</nav>

			<div class="border-surface-z2 border-t p-3">
				<RoleCard {role} routes={routeAccess} />
			</div>

			<div class="border-surface-z2 border-t p-3">
				<SentryConfigPanel rules={sentryRules} />
			</div>

			<div class="border-surface-z2 mt-auto border-t p-3">
				<HackerToggle />
			</div>
		</aside>

		<!-- Main -->
		<main class="flex-1 overflow-y-auto p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>

<FloatingBadge {adapterId} {adapterLabel} />
