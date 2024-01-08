<script>
	let className = ''

	export { className as class }
	export let width = '100%'
	export let height = 72
	export let layers = []
	export let seconds = 10
	export let animation = true
	export let direction = 'y'
</script>

<svg {width} {height} viewBox="0 0 320 72" style:--seconds="{seconds}s" class={className}>
	{#each layers as layer}
		<g class={layer.class} fill={layer.fill}>
			{#each layer.items as item, index}
				{#if item.rx === item.ry}
					<circle
						class:bobble={animation}
						class:bobble-x={direction === 'x'}
						cx={item.cx}
						cy={item.cy}
						r={item.r}
						style:animation-delay={`${index / 2}s`}
					/>
				{:else}
					<ellipse
						class:bobble={animation}
						class:bobble-x={direction === 'x'}
						cx={item.cx}
						cy={item.cy}
						rx={item.rx}
						ry={item.ry}
						style:animation-delay={`${index / 2}s`}
					/>
				{/if}
			{/each}
		</g>
	{/each}
</svg>

<style>
	@keyframes bob-y {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes bob-x {
		0% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(-10px);
		}
		100% {
			transform: translateX(0);
		}
	}

	.bobble {
		animation-name: bob-y;
		animation-duration: var(--seconds);
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
	.bobble-x {
		animation-name: bob-x;
	}
</style>
