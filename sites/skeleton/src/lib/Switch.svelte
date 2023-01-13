<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let label = 'Use Setting'
	export let isChecked = false
	export let tabindex = 0

	function toggle() {
		isChecked = !isChecked
		dispatch('change', { isChecked })
	}
</script>

<button
	role="switch"
	class="w-16 h-8 flex flex-shrink-0 rounded-full relative transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2"
	{tabindex}
	aria-checked={isChecked}
	on:click={toggle}
>
	<span class="sr-only">{label}</span>
	<mark aria-hidden="true" />
</button>

<style>
	.sr-only {
		@apply hidden;
	}
	button mark {
		@apply pointer-events-none transition ease-in-out duration-200;
		@apply h-6 w-6 rounded-full absolute top-1;
	}
	button[aria-checked='false'] mark {
		@apply left-1;
	}
	button[aria-checked='true'] mark {
		@apply right-1;
	}
</style>
