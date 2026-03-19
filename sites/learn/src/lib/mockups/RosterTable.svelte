<script lang="ts">
	import type { GYM_MEMBERS } from '$lib/mockups/fitness-data'
	interface Props {
		members: typeof GYM_MEMBERS
	}
	let { members }: Props = $props()
</script>

<div class="border-surface-z3 overflow-hidden rounded-2xl border">
	<table class="w-full text-sm">
		<thead>
			<tr
				class="border-surface-z3 bg-surface-z1 text-surface-z5 border-b text-left text-xs font-semibold tracking-wider uppercase"
			>
				<th class="px-4 py-3">Member</th>
				<th class="px-4 py-3">Membership</th>
				<th class="px-4 py-3">Trainer</th>
				<th class="px-4 py-3 text-right">Check-ins</th>
				<th class="px-4 py-3">Status</th>
			</tr>
		</thead>
		<tbody>
			{#each members as m (m.id)}
				<tr
					class="border-surface-z2 text-surface-z7 hover:bg-surface-z1 border-b transition-colors"
				>
					<td class="text-surface-z9 px-4 py-3 font-medium">{m.name}</td>
					<td class="px-4 py-3">
						<span
							class="rounded-full px-2 py-0.5 text-xs font-medium {m.membership === 'Premium'
								? 'bg-indigo-100 text-indigo-700'
								: 'bg-surface-z2 text-surface-z6'}"
						>
							{m.membership}
						</span>
					</td>
					<td class="text-surface-z6 px-4 py-3">{m.trainer ?? '—'}</td>
					<td class="px-4 py-3 text-right font-mono">{m.checkins}</td>
					<td class="px-4 py-3">
						<span
							class="mr-1.5 inline-block h-2 w-2 rounded-full {m.status === 'active'
								? 'bg-emerald-400'
								: 'bg-surface-z4'}"
						></span>
						<span
							class="text-xs capitalize {m.status === 'active'
								? 'text-emerald-600'
								: 'text-surface-z5'}">{m.status}</span
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
