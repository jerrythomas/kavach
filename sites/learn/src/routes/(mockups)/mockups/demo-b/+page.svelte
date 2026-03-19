<script lang="ts">
	import { GYM_MEMBERS, HACKER_LOG } from '$lib/mockups/fitness-data'
	import RosterTable from '$lib/mockups/RosterTable.svelte'
	import HackerPanel from '$lib/mockups/HackerPanel.svelte'

	type Role = 'member' | 'trainer' | 'admin'
	type Screen = 'login' | 'member' | 'trainer' | 'admin' | 'hacker'

	let screen = $state<Screen>('login')
	let role = $state<Role | null>(null)
	let hackerMode = $state(false)

	const personas: { name: string; role: Role; sub: string }[] = [
		{ name: 'Taylor Chen', role: 'member', sub: 'Premium · Coach Maya' },
		{ name: 'Coach Maya', role: 'trainer', sub: 'Trainer · 2 clients' },
		{ name: 'Admin', role: 'admin', sub: 'Administrator' }
	]

	function loginAs(p: (typeof personas)[number]) {
		role = p.role
		screen = p.role === 'member' ? 'member' : p.role === 'trainer' ? 'trainer' : 'admin'
	}

	function tryNav(s: Screen, required: Role[]) {
		if (required.includes(role!)) screen = s
		else if (hackerMode) screen = 'hacker'
	}

	const stats = [
		{ label: 'Active Members', value: '3', change: '+2 this month' },
		{ label: 'Trainers', value: '2', change: '1 new' },
		{ label: 'Avg Check-ins', value: '33', change: 'per member' },
		{ label: 'Retention', value: '75%', change: '+5% vs last month' }
	]
</script>

<div class="bg-surface-z0 text-surface-z9 flex h-full flex-col">
	{#if screen === 'login'}
		<!-- Login: light, multi-tenant feel -->
		<div
			class="to-surface-z0 flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-50/50"
		>
			<div class="w-full max-w-sm">
				<div class="border-surface-z3 bg-surface-z0 rounded-2xl border p-8 shadow-xl">
					<div class="mb-6 text-center">
						<div
							class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600"
						>
							<span class="i-app-shield h-5 w-5 text-white"></span>
						</div>
						<h1 class="text-xl font-bold">GymOS</h1>
						<p class="text-surface-z5 mt-1 text-sm">Iron Peak Fitness · Member portal</p>
					</div>

					<p class="text-surface-z5 mb-3 text-center text-xs">Sign in as</p>
					<div class="flex flex-col gap-2">
						{#each personas as p (p.role)}
							<button
								onclick={() => loginAs(p)}
								class="border-surface-z3 flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:border-indigo-400"
							>
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600"
								>
									{p.name[0]}
								</div>
								<div>
									<p class="text-surface-z9 text-sm font-medium">{p.name}</p>
									<p class="text-surface-z5 text-xs">{p.sub}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- App shell: light SaaS -->
		<header
			class="border-surface-z3 bg-surface-z0 flex h-14 shrink-0 items-center border-b px-6 shadow-sm"
		>
			<div class="flex items-center gap-2">
				<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
					<span class="i-app-shield h-4 w-4 text-white"></span>
				</div>
				<span class="font-bold">GymOS</span>
				<span class="text-surface-z4">·</span>
				<span class="text-surface-z5 text-sm">Iron Peak Fitness</span>
			</div>
			<div class="flex-1"></div>
			<!-- Hacker toggle -->
			<label class="text-surface-z6 mr-4 flex cursor-pointer items-center gap-2 text-xs">
				<span>Hacker mode</span>
				<div
					class="relative h-5 w-9 rounded-full transition-colors {hackerMode
						? 'bg-red-500'
						: 'bg-surface-z3'}"
				>
					<input type="checkbox" class="sr-only" bind:checked={hackerMode} />
					<div
						class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all {hackerMode
							? 'left-[18px]'
							: 'left-0.5'}"
					></div>
				</div>
			</label>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
			>
				{personas.find((p) => p.role === role)?.name[0] ?? '?'}
			</div>
			<span class="text-surface-z5 ml-2 text-xs capitalize">{role}</span>
		</header>

		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar -->
			<aside class="border-surface-z3 bg-surface-z1 flex w-56 shrink-0 flex-col border-r py-4">
				<nav class="flex flex-col gap-0.5 px-3">
					{#each [{ id: 'member' as Screen, label: 'My Membership', icon: 'i-app-list', roles: ['member', 'trainer', 'admin'] as Role[] }, { id: 'trainer' as Screen, label: 'Clients', icon: 'i-app-list', roles: ['trainer', 'admin'] as Role[] }, { id: 'admin' as Screen, label: 'Admin', icon: 'i-app-shield', roles: ['admin'] as Role[] }] as item (item.id)}
						{@const allowed = item.roles.includes(role!)}
						<button
							onclick={() => tryNav(item.id, item.roles)}
							class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors {screen ===
								item.id && allowed
								? 'bg-indigo-50 font-medium text-indigo-700'
								: allowed
									? 'text-surface-z7 hover:bg-surface-z2'
									: 'text-surface-z4 cursor-not-allowed'}"
						>
							<span class="{item.icon} h-4 w-4"></span>
							{item.label}
							{#if !allowed}
								<span
									class="border-surface-z3 text-surface-z4 ml-auto rounded border px-1.5 py-0.5 font-mono text-xs"
								>
									{item.roles[0]}
								</span>
							{/if}
						</button>
					{/each}
				</nav>

				<!-- Access summary -->
				<div class="border-surface-z3 mx-3 mt-auto rounded-xl border p-3 text-xs">
					<p class="text-surface-z5 mb-2 font-semibold tracking-wider uppercase">Your role</p>
					<span
						class="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 capitalize"
						>{role}</span
					>
				</div>
			</aside>

			<!-- Main -->
			<main class="flex-1 overflow-y-auto p-6">
				{#if screen === 'member'}
					<h2 class="text-surface-z9 mb-6 text-xl font-bold">My Membership</h2>
					<div class="border-surface-z3 bg-surface-z1 mb-4 rounded-2xl border p-5">
						<div class="flex items-center gap-4">
							<div class="rounded-xl bg-indigo-100 p-3">
								<span class="i-app-shield h-6 w-6 text-indigo-600"></span>
							</div>
							<div>
								<p class="text-surface-z9 font-semibold">Premium Membership</p>
								<p class="text-surface-z5 text-sm">Active · Next billing Mar 31</p>
							</div>
							<span
								class="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
								>Active</span
							>
						</div>
					</div>
					<div class="grid gap-4 sm:grid-cols-3">
						{#each [{ label: 'Check-ins this month', value: '12' }, { label: 'Classes booked', value: '4' }, { label: 'Streak', value: '5 days' }] as s (s.label)}
							<div class="border-surface-z3 bg-surface-z1 rounded-2xl border p-4 text-center">
								<p class="text-surface-z9 text-2xl font-black">{s.value}</p>
								<p class="text-surface-z5 mt-1 text-xs">{s.label}</p>
							</div>
						{/each}
					</div>
					{#if hackerMode}
						<div class="mt-6">
							<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-wider uppercase">
								Sentry log
							</p>
							<HackerPanel theme="terminal" />
						</div>
					{/if}
				{:else if screen === 'trainer'}
					<h2 class="text-surface-z9 mb-6 text-xl font-bold">My Clients</h2>
					<RosterTable members={GYM_MEMBERS.filter((m) => m.trainer === 'Coach Maya')} />
				{:else if screen === 'admin'}
					<h2 class="text-surface-z9 mb-6 text-xl font-bold">Admin Overview</h2>
					<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{#each stats as s (s.label)}
							<div class="border-surface-z3 bg-surface-z1 rounded-2xl border p-4">
								<p class="text-surface-z9 text-2xl font-black">{s.value}</p>
								<p class="text-surface-z7 text-sm font-medium">{s.label}</p>
								<p class="text-surface-z5 mt-0.5 text-xs">{s.change}</p>
							</div>
						{/each}
					</div>
					<RosterTable members={GYM_MEMBERS} />
				{:else if screen === 'hacker'}
					<div class="flex flex-col items-center py-12">
						<div
							class="border-surface-z3 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-red-50"
						>
							<span class="i-app-shield h-8 w-8 text-red-500"></span>
						</div>
						<h2 class="text-surface-z9 mb-2 text-xl font-bold">Access Denied</h2>
						<p class="text-surface-z6 mb-6 text-sm">
							Your role doesn't have permission for this route.
						</p>
						<HackerPanel theme="terminal" />
						<button
							onclick={() => (screen = role === 'member' ? 'member' : 'trainer')}
							class="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
						>
							← Go back
						</button>
					</div>
				{/if}
			</main>
		</div>
	{/if}
</div>
