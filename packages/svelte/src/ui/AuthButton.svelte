<script>
	import { Button } from '@rokkit/molecules'
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

<Button on:click={handle} {label} leftIcon="logo-{provider}" />
