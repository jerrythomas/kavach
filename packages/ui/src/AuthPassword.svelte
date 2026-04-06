<script>
	import { Button } from '@rokkit/ui'
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

	let { type = 'email', value = $bindable(''), password = $bindable(''), onclick } = $props()

	const inputType = $derived(inputTypeMap[type] ?? type)

	function handle(e) {
		e?.preventDefault()
		onclick?.({ [type]: value, password })
	}
</script>

<form onsubmit={handle}>
	<InputField
		name={type}
		type={inputType}
		icon="i-auth-{type}"
		label={type}
		autocomplete={type === 'email' ? 'email' : 'username'}
		bind:value
	/>
	<InputField
		name="password"
		type="password"
		icon="i-auth-password"
		label="Password"
		autocomplete="current-password"
		bind:value={password}
	/>
	<Button
		type="submit"
		class="col-start-3 mt-4 h-10 cursor-pointer rounded bg-purple-600 text-center text-white hover:bg-purple-700"
		data-auth-mode="password"
	>
		Sign in
	</Button>
</form>
