<script lang="ts">
	import { page } from '$app/stores'
	import DemoNavItem from './DemoNavItem.svelte'
	import RoleCard from './RoleCard.svelte'
	import SentryConfigPanel from './SentryConfigPanel.svelte'
	import HackerToggle from './HackerToggle.svelte'

	let {
		platform,
		user,
		role
	}: {
		platform: string
		user: { email: string } | null
		role: string | null
	} = $props()

	const base = $derived(`/demo/${platform}`)

	const routeAccess = $derived([
		{ path: `${base}/dashboard`, roles: '*', allowed: true },
		{ path: `${base}/data`, roles: '*', allowed: true },
		{ path: `${base}/admin`, roles: ['admin'], allowed: role === 'admin' }
	])

	const sentryRules = $derived([
		{ path: `${base}/dashboard`, roles: '*', allowed: true },
		{ path: `${base}/data`, roles: '*', allowed: true },
		{ path: `${base}/admin`, roles: ['admin'], allowed: role === 'admin' },
		{ path: '/data/facts', roles: '*', allowed: true },
		{ path: '/data/admin-stats', roles: ['admin'], allowed: role === 'admin' }
	])
</script>

<nav class="flex h-full flex-col gap-6 p-4">
	<!-- Navigation -->
	<div class="flex flex-col gap-1">
		<span class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Navigate</span
		>
		<DemoNavItem href="{base}/dashboard" label="Dashboard" icon="i-app-login" />
		<DemoNavItem href="{base}/data" label="Space Facts" icon="i-app-list" />
		<DemoNavItem href="{base}/admin" label="Admin" icon="i-app-shield" locked={role !== 'admin'} />
		<DemoNavItem href="{base}/logout" label="Sign Out" icon="i-app-logout" />
	</div>

	<div class="border-surface-z2 border-t pt-4">
		<RoleCard {role} routes={routeAccess} />
	</div>

	<div class="border-surface-z2 border-t pt-4">
		<SentryConfigPanel rules={sentryRules} />
	</div>

	<div class="border-surface-z2 mt-auto border-t pt-4">
		<HackerToggle />
	</div>
</nav>
