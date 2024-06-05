<script>
	import { InputField } from '@rokkit/organisms'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let type = 'email'
	export let value = ''
	export let password = ''

	function handle() {
		dispatch('click', { [type]: value, password })
	}

	$: type = type === 'phone' ? 'tel' : type
</script>

<InputField
	name="email"
	{type}
	icon="i-auth-{type}"
	label={type}
	autocomplete="on"
	bind:value
/>
<InputField
	name="password"
	type="password"
	icon="i-auth-password"
	label="Password"
	bind:password
/>
<button
	on:click={handle}
	class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
>
	Sign in
</button>
