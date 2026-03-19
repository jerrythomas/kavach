<script>
	import { browser } from '$app/environment'

	/**
	 * Decorative floating circles for gradient CTA sections.
	 * All values are randomised at mount time — tweak props to control the range.
	 */
	let {
		count = 6,
		minSize = 10,
		maxSize = 70,
		minOpacity = 0.06,
		maxOpacity = 0.18,
		color = 'rgba(255,255,255,1)'
	} = $props()

	const animations = ['float-a', 'float-b', 'float-c']

	function rand(min, max) {
		return min + Math.random() * (max - min)
	}

	// Only generate on the client to avoid SSR/hydration mismatch.
	const circles = browser
		? Array.from({ length: count }, () => ({
				size: rand(minSize, maxSize),
				top: rand(0, 90),
				left: rand(0, 90),
				opacity: rand(minOpacity, maxOpacity),
				animation: animations[Math.floor(Math.random() * animations.length)],
				duration: rand(6, 12),
				delay: rand(0, 3)
			}))
		: []
</script>

{#each circles as c}
	<div
		style="
      width: {c.size}px;
      height: {c.size}px;
      top: {c.top}%;
      left: {c.left}%;
      opacity: {c.opacity};
      animation: {c.animation} {c.duration}s ease-in-out infinite {c.delay}s;
      background: {color};
    "
		aria-hidden="true"
	></div>
{/each}

<style>
	div {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}
	/* :global so animation names aren't scoped — inline style references need the raw name */
	:global {
		@keyframes float-a {
			0%,
			100% {
				transform: translateY(0) scale(1);
			}
			50% {
				transform: translateY(-14px) scale(1.05);
			}
		}
		@keyframes float-b {
			0%,
			100% {
				transform: translateY(0) scale(1);
			}
			50% {
				transform: translateY(10px) scale(0.96);
			}
		}
		@keyframes float-c {
			0%,
			100% {
				transform: translate(0, 0);
			}
			50% {
				transform: translate(8px, -8px);
			}
		}
	}
</style>
