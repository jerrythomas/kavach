<script>
	import { InputField } from '@rokkit/organisms'
	import { createEventDispatcher } from '@svelte'

	const dispatch = createEventDispatcher()

	export let type = 'email'
	export let value = ''
	export let password = ''

	function handle() {
		dispatch('click', { [type]: value, password })
	}
</script>

<InputField {type} icon="logo-{type}" label={type} bind:value />
<InputField type="password" icon="logo-{type}" label="Password" bind:password />
<button
	on:click={handle}
	class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
>
	Sign in
</button>
