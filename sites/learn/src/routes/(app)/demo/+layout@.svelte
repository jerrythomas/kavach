<script lang="ts">
	import 'uno.css'
	import '../../../app.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'
	import { getPlatform } from '$lib/demo/platforms'
	import DemoSidebar from '$lib/demo/DemoSidebar.svelte'
	import FloatingBadge from '$lib/demo/FloatingBadge.svelte'

	let { children, data } = $props()

	let kavachInstance = $state<any>(null)

	setContext('kavach', {
		get signIn() {
			return kavachInstance?.signIn
		},
		get signUp() {
			return kavachInstance?.signUp
		},
		get signOut() {
			return kavachInstance?.signOut
		},
		get onAuthChange() {
			return kavachInstance?.onAuthChange
		},
		get getCachedLogins() {
			return kavachInstance?.getCachedLogins
		},
		get removeCachedLogin() {
			return kavachInstance?.removeCachedLogin
		},
		get clearCachedLogins() {
			return kavachInstance?.clearCachedLogins
		}
	})

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')
		const instance = createKavach(adapter, { logger, invalidateAll })
		kavachInstance = instance
		instance.onAuthChange($page.url)
	})

	const platformId = $derived($page.params.platform)
	const platform = $derived(getPlatform(platformId))
	// data.user comes from layout.server.ts: locals.session?.user ?? null
	const user = $derived(data?.user ?? null)
	const role = $derived(user?.role ?? null)

	let sidebarOpen = $state(false)
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

<div class="bg-surface-z0 text-surface-z9 flex h-screen flex-col overflow-hidden">
	<!-- Top bar -->
	<header class="border-surface-z2 bg-surface-z1 flex h-14 shrink-0 items-center border-b px-4">
		<!-- Mobile sidebar toggle -->
		<button
			class="text-surface-z6 hover:text-surface-z9 mr-3 lg:hidden"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label="Toggle sidebar"
		>
			<span class="i-app-list h-5 w-5" aria-hidden="true"></span>
		</button>

		<!-- App name -->
		<div class="flex items-center gap-2">
			<span class="text-surface-z9 font-bold">DemoApp</span>
			{#if platform}
				<span class="text-surface-z3">·</span>
				<div class="flex items-center gap-1.5">
					<span class="{platform.icon} h-4 w-4 text-sm" aria-hidden="true"></span>
					<span class="text-surface-z6 text-sm">{platform.name}</span>
				</div>
			{/if}
		</div>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- Right: theme + user -->
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
						<span class="font-mono text-xs {role === 'admin' ? 'text-warning-600' : 'text-primary'}"
							>{role ?? 'authenticated'}</span
						>
					</div>
				</div>
			{/if}
		</div>
	</header>

	<!-- Body: sidebar + content -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar — hidden on mobile unless open -->
		<aside
			class="border-surface-z2 bg-surface-z1 w-64 shrink-0 overflow-y-auto border-r transition-transform duration-200
        {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed inset-y-14 z-30 lg:relative lg:inset-y-0"
		>
			<DemoSidebar platform={platformId} {user} {role} />
		</aside>

		<!-- Mobile overlay -->
		{#if sidebarOpen}
			<div
				class="fixed inset-0 z-20 bg-black/40 lg:hidden"
				role="presentation"
				onclick={() => (sidebarOpen = false)}
			></div>
		{/if}

		<!-- Main content -->
		<main class="flex-1 overflow-y-auto p-6 lg:p-8">
			{@render children()}
		</main>
	</div>

	<!-- Floating badge -->
	{#if platformId}
		<FloatingBadge platform={platformId} />
	{/if}
</div>
