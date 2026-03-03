<script>
	import { InputField } from '@rokkit/forms'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {'email' | 'phone'} type - The type of input field.
	 * @property {string} value - The value of the input field.
	 * @property {string} password - The password value.
	 * @property {Function} onclick - The function to be called when the button is clicked.
	 */
	const inputTypeMap = { phone: 'tel' }

	let {
		type = 'email',
		value = $bindable(''),
		password = $bindable(''),
		onclick
	} = $props()

	const inputType = $derived(inputTypeMap[type] ?? type)

	function handle() {
		onclick?.({ [type]: value, password })
	}
</script>

<InputField
	name={type}
	type={inputType}
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
	class="col-start-3 text-center h-10 mt-4 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-700"
>
	Sign in
</button>
