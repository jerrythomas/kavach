<script lang="ts">
	interface Props {
		pct: number
		size?: number
		stroke?: number
		label?: string
	}
	let { pct, size = 64, stroke = 6, label }: Props = $props()
	const r = $derived((size - stroke) / 2)
	const circ = $derived(2 * Math.PI * r)
	const dash = $derived(circ * (pct / 100))
</script>

<div class="relative flex items-center justify-center" style="width:{size}px;height:{size}px">
	<svg width={size} height={size} class="-rotate-90">
		<circle
			cx={size / 2}
			cy={size / 2}
			{r}
			fill="none"
			stroke="currentColor"
			stroke-width={stroke}
			class="text-surface-z3 opacity-30"
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			{r}
			fill="none"
			stroke="currentColor"
			stroke-width={stroke}
			class="text-cyan-400"
			stroke-dasharray="{dash} {circ}"
			stroke-linecap="round"
		/>
	</svg>
	{#if label}
		<span class="absolute text-xs font-bold text-cyan-400">{label}</span>
	{/if}
</div>
