<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'

	let { data }: { data: PageData } = $props()

	const platform = $derived($page.params.platform || 'supabase')
	const userRole = $derived(data.user?.role ?? null)

	type LogEntry = {
		time: string
		label: string
		role: string | null
		outcome: 'allowed' | 'denied'
	}

	let accessLog = $state<LogEntry[]>([])

	const routeCards = $derived([
		{
			path: `/docs`,
			label: 'Documentation',
			desc: 'Public docs — no login required',
			badge: '🔓 Public',
			badgeClass: 'bg-success-100 text-success-800',
			allowed: true
		},
		{
			path: `/demo/${platform}`,
			label: 'Dashboard',
			desc: 'Requires authentication',
			badge: '🔑 Authenticated',
			badgeClass: 'bg-blue-100 text-blue-800',
			allowed: !!userRole
		},
		{
			path: `/demo/${platform}/data`,
			label: 'Space Facts',
			desc: 'Requires authentication',
			badge: '🔑 Authenticated',
			badgeClass: 'bg-blue-100 text-blue-800',
			allowed: !!userRole
		},
		{
			path: `/demo/${platform}/admin`,
			label: 'Admin Panel',
			desc: 'Admin role required',
			badge: '👑 Admin only',
			badgeClass: 'bg-warning-100 text-warning-800',
			allowed: userRole === 'admin'
		}
	])

	function navigate(card: (typeof routeCards)[0]) {
		const time = new Date().toLocaleTimeString()
		accessLog = [
			{ time, label: card.label, role: userRole, outcome: card.allowed ? 'allowed' : 'denied' },
			...accessLog
		].slice(0, 8)
		goto(card.path)
	}
</script>

<div class="flex flex-col gap-6 p-8">
	<div>
		<h1 class="text-2xl font-bold">Kavach Demo Dashboard</h1>
		<p class="text-surface-z7 mt-1 text-sm">
			Signed in as <strong>{data.user?.email}</strong> — role:
			<span
				class="rounded px-1.5 py-0.5 text-xs font-semibold uppercase"
				class:bg-success-100={userRole === 'admin'}
				class:text-success-800={userRole === 'admin'}
				class:bg-surface-z2={userRole !== 'admin'}
				class:text-surface-z7={userRole !== 'admin'}
			>
				{userRole ?? 'none'}
			</span>
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each routeCards as card (card.path)}
			<button
				onclick={() => navigate(card)}
				class="border-surface-z3 hover:bg-surface-z1 flex flex-col items-start gap-2 rounded-lg border p-5 text-left transition-colors"
				class:opacity-60={!card.allowed}
			>
				<div class="flex w-full items-center justify-between">
					<span class="font-semibold">{card.label}</span>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {card.badgeClass}">
						{card.badge}
					</span>
				</div>
				<p class="text-surface-z7 text-sm">{card.desc}</p>
				<span
					class="text-xs font-medium"
					class:text-success-600={card.allowed}
					class:text-error-600={!card.allowed}
				>
					{card.allowed ? '✓ You have access' : '✗ Access denied'}
				</span>
			</button>
		{/each}
	</div>

	{#if accessLog.length > 0}
		<div>
			<h2 class="text-surface-z5 mb-2 text-sm font-semibold uppercase">Access Log</h2>
			<div class="border-surface-z3 divide-surface-z2 divide-y overflow-hidden rounded-lg border">
				{#each accessLog as entry, i (i)}
					<div class="flex items-center gap-3 px-4 py-2 text-sm">
						<span class="text-surface-z6 font-mono text-xs">{entry.time}</span>
						<span class="flex-1 font-medium">{entry.label}</span>
						<span class="text-surface-z7 text-xs">role: {entry.role ?? 'none'}</span>
						<span
							class="rounded px-1.5 py-0.5 text-xs font-semibold"
							class:bg-success-100={entry.outcome === 'allowed'}
							class:text-success-800={entry.outcome === 'allowed'}
							class:bg-error-100={entry.outcome === 'denied'}
							class:text-error-800={entry.outcome === 'denied'}
						>
							{entry.outcome}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
