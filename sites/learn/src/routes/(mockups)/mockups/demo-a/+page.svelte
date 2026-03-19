<script lang="ts">
	import { ATHLETES, COACHES, ADMIN, type FitUser, type Role } from '$lib/mockups/fitness-data'
	import WorkoutCard from '$lib/mockups/WorkoutCard.svelte'
	import AthleteCard from '$lib/mockups/AthleteCard.svelte'
	import HackerPanel from '$lib/mockups/HackerPanel.svelte'

	type Screen = 'login' | 'athlete' | 'coach' | 'admin' | 'hacker'

	let screen = $state<Screen>('login')
	let currentUser = $state<FitUser | null>(null)
	let hackerMode = $state(false)
	let selectedAthlete = $state(ATHLETES[0])

	function loginAs(user: FitUser) {
		currentUser = user
		screen = user.role === 'athlete' ? 'athlete' : user.role === 'coach' ? 'coach' : 'admin'
	}
	function logout() {
		currentUser = null
		screen = 'login'
	}

	const role = $derived(currentUser?.role ?? null)

	const navItems = [
		{ id: 'athlete' as Screen, label: 'My Training', icon: 'i-app-list', roles: ['athlete'] },
		{ id: 'coach' as Screen, label: 'My Athletes', icon: 'i-app-list', roles: ['coach'] },
		{ id: 'admin' as Screen, label: 'Admin Panel', icon: 'i-app-shield', roles: ['admin'] }
	]

	function tryNav(s: Screen, requiredRoles: string[]) {
		if (requiredRoles.includes(role ?? '')) {
			screen = s
		} else if (hackerMode) {
			screen = 'hacker'
		}
	}

	const coach = $derived(
		currentUser?.role === 'athlete'
			? COACHES.find((c) => c.id === (currentUser as any).coachId)
			: null
	)
	const coachAthletes = $derived(
		currentUser?.role === 'coach'
			? ATHLETES.filter((a) => (currentUser as any).athleteIds?.includes(a.id))
			: []
	)
</script>

<div class="bg-surface-z0 flex h-full flex-col">
	{#if screen === 'login'}
		<!-- Login: clean panel on surface background -->
		<div class="bg-surface-z0 flex flex-1 items-center justify-center">
			<div class="w-full max-w-sm">
				<!-- Panel -->
				<div class="border-surface-z3 bg-surface-z0 rounded-2xl border p-8 shadow-xl">
					<!-- Header -->
					<div class="mb-6 text-center">
						<div
							class="bg-surface-z2 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
						>
							<span class="i-app-shield text-primary h-6 w-6"></span>
						</div>
						<h1 class="text-surface-z9 text-2xl font-black">FitTrack</h1>
						<p class="text-surface-z5 mt-1 text-sm">Sign in to continue</p>
					</div>

					<!-- Role picker -->
					<p class="text-surface-z5 mb-3 text-center text-xs tracking-widest uppercase">
						Sign in as
					</p>
					<div class="flex flex-col gap-2">
						{#each ATHLETES as athlete (athlete.id)}
							<button
								onclick={() => loginAs(athlete)}
								class="border-surface-z3 hover:border-primary relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
							>
								<!-- Role badge top-right -->
								<span
									class="absolute top-2.5 right-3 rounded-full bg-cyan-500/15 px-2 py-0.5 font-mono text-xs text-cyan-600"
								>
									Athlete
								</span>
								<div
									class="bg-surface-z2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-cyan-600"
								>
									{athlete.name[0]}
								</div>
								<div>
									<p class="text-surface-z9 text-sm font-medium">{athlete.name}</p>
									<p class="text-surface-z5 text-xs">{athlete.plan}</p>
								</div>
							</button>
						{/each}

						{#each COACHES as coach (coach.id)}
							<button
								onclick={() => loginAs(coach)}
								class="border-surface-z3 hover:border-primary relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
							>
								<!-- Role badge top-right -->
								<span
									class="absolute top-2.5 right-3 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-xs text-amber-600"
								>
									Coach
								</span>
								<div
									class="bg-surface-z2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-amber-600"
								>
									{coach.name[0]}
								</div>
								<div>
									<p class="text-surface-z9 text-sm font-medium">{coach.name}</p>
									<p class="text-surface-z5 text-xs">{coach.specialty}</p>
								</div>
							</button>
						{/each}

						<button
							onclick={() => loginAs(ADMIN)}
							class="border-surface-z3 hover:border-primary relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
						>
							<!-- Role badge top-right -->
							<span
								class="absolute top-2.5 right-3 rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-xs text-red-600"
							>
								Admin
							</span>
							<div
								class="bg-surface-z2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-red-600"
							>
								A
							</div>
							<div>
								<p class="text-surface-z9 text-sm font-medium">Admin</p>
								<p class="text-surface-z5 text-xs">Full access</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Dark athletic app shell -->
		<div class="flex h-full flex-col" style="background:#0a0a0f;color:#f0f0f5">
			<header
				class="flex h-14 shrink-0 items-center border-b px-5"
				style="border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)"
			>
				<span class="font-black tracking-tight text-white">FitTrack</span>
				<span class="ml-3 rounded-full bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-400"
					>{role}</span
				>
				<div class="flex-1"></div>

				<!-- Hacker toggle -->
				<label class="mr-4 flex cursor-pointer items-center gap-2 text-xs text-white/40">
					<span>Hacker mode</span>
					<div
						class="relative h-5 w-9 rounded-full transition-colors"
						style="background:{hackerMode ? '#ef4444' : 'rgba(255,255,255,0.1)'}"
					>
						<input type="checkbox" class="sr-only" bind:checked={hackerMode} />
						<div
							class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
							style="left:{hackerMode ? '18px' : '2px'}"
						></div>
					</div>
				</label>

				<div
					class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400"
				>
					{currentUser && 'name' in currentUser ? currentUser.name[0] : '?'}
				</div>
				<button onclick={logout} class="text-xs text-white/40 transition-colors hover:text-white/70"
					>Sign out</button
				>
			</header>

			<div class="flex flex-1 overflow-hidden">
				<!-- Sidebar -->
				<aside
					class="flex w-52 shrink-0 flex-col border-r py-4"
					style="border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.02)"
				>
					<nav class="flex flex-col gap-1 px-3">
						{#each navItems as item (item.id)}
							{@const allowed = item.roles.includes(role ?? '')}
							<button
								onclick={() => tryNav(item.id, item.roles)}
								class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors
                {screen === item.id && allowed ? 'bg-cyan-500/15 font-semibold text-cyan-400' : ''}
                {screen === item.id && !allowed ? 'font-semibold text-white' : ''}
                {!allowed ? 'text-white/30' : ''}
                {allowed && screen !== item.id ? 'text-white/60' : ''}"
							>
								<span class="{item.icon} h-4 w-4"></span>
								{item.label}
								{#if !allowed}
									<span class="i-app-shield ml-auto h-3 w-3 text-white/20"></span>
								{/if}
							</button>
						{/each}
					</nav>

					<!-- Role card -->
					<div
						class="mx-3 mt-4 rounded-xl border p-3 text-xs"
						style="border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)"
					>
						<p class="mb-2 font-semibold tracking-widest text-white/30 uppercase">Access</p>
						{#each navItems as item (item.id)}
							<div class="flex items-center gap-2 py-0.5">
								<span
									class="h-1.5 w-1.5 rounded-full {item.roles.includes(role ?? '')
										? 'bg-cyan-400'
										: 'bg-red-500/60'}"
								></span>
								<span class={item.roles.includes(role ?? '') ? 'text-white/60' : 'text-white/25'}
									>{item.label}</span
								>
							</div>
						{/each}
					</div>
				</aside>

				<!-- Main -->
				<main class="flex-1 overflow-y-auto p-6">
					{#if screen === 'athlete' && currentUser?.role === 'athlete'}
						<h2 class="mb-6 text-2xl font-black text-white">
							Hey {currentUser.name.split(' ')[0]} 👋
						</h2>
						<div class="grid gap-4 lg:grid-cols-2">
							<WorkoutCard athlete={currentUser} />
							<div class="rounded-2xl border border-white/10 bg-white/5 p-5">
								<p class="mb-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
									Your Coach
								</p>
								{#if coach}
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400"
										>
											{coach.name[0]}
										</div>
										<div>
											<p class="font-semibold text-white">{coach.name}</p>
											<p class="text-xs text-white/50">{coach.specialty}</p>
										</div>
									</div>
									<div
										class="mt-4 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-white/60 italic"
									>
										"Great work on your streak! Focus on form this week, not weight."
									</div>
								{/if}
							</div>
						</div>
						{#if hackerMode}
							<div class="mt-6">
								<p class="mb-2 text-xs tracking-widest text-white/30 uppercase">
									Attempted blocked routes:
								</p>
								<HackerPanel theme="dark" />
							</div>
						{/if}
					{:else if screen === 'coach' && currentUser?.role === 'coach'}
						<h2 class="mb-6 text-2xl font-black text-white">Athletes</h2>
						<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{#each coachAthletes as athlete (athlete.id)}
								<div>
									<AthleteCard {athlete} onclick={() => (selectedAthlete = athlete)} />
								</div>
							{/each}
						</div>
						{#if selectedAthlete}
							<div class="mt-6">
								<WorkoutCard athlete={selectedAthlete} />
							</div>
						{/if}
					{:else if screen === 'admin'}
						<h2 class="mb-6 text-2xl font-black text-white">Admin Panel</h2>
						<div class="overflow-hidden rounded-2xl border border-white/10">
							<table class="w-full text-sm">
								<thead>
									<tr
										class="border-b border-white/10 bg-white/5 text-left text-xs tracking-widest text-white/30 uppercase"
									>
										<th class="px-4 py-3">Name</th>
										<th class="px-4 py-3">Role</th>
										<th class="px-4 py-3">Plan / Specialty</th>
									</tr>
								</thead>
								<tbody>
									{#each [...ATHLETES, ...COACHES] as user (user.id)}
										<tr class="border-b border-white/5 text-white/70 hover:bg-white/5">
											<td class="px-4 py-3">{user.name}</td>
											<td class="px-4 py-3 capitalize">{user.role}</td>
											<td class="px-4 py-3 text-white/40"
												>{'plan' in user ? user.plan : user.specialty}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if screen === 'hacker'}
						<div class="flex flex-col items-center py-12">
							<div
								class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10"
							>
								<span class="i-app-shield h-8 w-8 text-red-400"></span>
							</div>
							<h2 class="mb-2 text-xl font-black text-white">Access Blocked</h2>
							<p class="mb-6 text-sm text-white/50">
								Kavach Sentry blocked your request. You don't have the required role.
							</p>
							<HackerPanel theme="dark" />
							<button
								onclick={() => (screen = currentUser?.role === 'athlete' ? 'athlete' : 'coach')}
								class="mt-6 rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30"
							>
								← Back to dashboard
							</button>
						</div>
					{/if}
				</main>
			</div>
		</div>
	{/if}
</div>
