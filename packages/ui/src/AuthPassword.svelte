<script>
	import { InputField } from '@rokkit/ui'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {'email' | 'phone'} type - The type of input field.
	 * @property {string} value - The value of the input field.
	 * @property {string} password - The password value.
	 * @property {Function} onclick - The function to be called when the button is clicked.
	 */
	let {
		type = 'email',
		value = $bindable(''),
		password = $bindable(''),
		onclick
	} = $props()

	function handle() {
		onclick?.({ [type]: value, password })
	}
</script>

<InputField
	name={type}
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
	bind:value={password}
/>
<button
	onclick={handle}
	class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
>
	Sign in
</button>
