<script>
	import { IconButton } from '@svelte-spice/form'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	/** @type {string} */
	export let provider
	/** @type {string} */
	export let label
	/** @type {Array<string>} */
	export let scopes = []

	function handle() {
		dispatch('click', { provider, scopes })
	}
</script>

<IconButton on:click={handle} {label} leftIcon="logo-{provider}" />
