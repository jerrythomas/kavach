<script>
	import { IconButton, InputField } from '@svelte-spice/form'
	import { getContext } from 'svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	const kavach = getContext('kavach')

	/** @type {'otp'|'oauth'|'password'} */
	export let mode = 'oauth'
	/** @type {string} */
	export let name
	/** @type {string} */
	export let label
	/** @type {Array<string>} */
	export let scopes = []

	let result
	let value
	let password
	async function signIn() {
		if (mode === 'password') {
			result = await kavach.signIn({ [name]: value, password })
		} else if (mode === 'otp') {
			result = await kavach.signIn({ provider: name, email: value })
		} else {
			await kavach.signIn({ provider: name, scopes })
		}
		if (result) {
			if (result.error) {
				dispatch('error', result.error)
			} else {
				dispatch('success', result.data)
			}
		}
	}
</script>

{#if mode === 'oauth'}
	<IconButton on:click={signIn} {label} leftIcon="logo-{name}" />
	<!-- <AuthButton provider={name} {label} {scopes} {params} on:click={signIn} /> -->
{:else if mode === 'password'}
	<InputField type={name} icon="logo-{name}" label={name} bind:value />
	<InputField
		type="password"
		icon="logo-password"
		label="Password"
		bind:password
	/>
	<button
		on:click={signIn}
		class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
	>
		Sign in
	</button>
	<!-- <AuthPassword {label} {} on:click={signIn} /> -->
{:else}
	<!-- <pre>
		provider:{name}
		{JSON.stringify(result, null, 2)}
	</pre> -->
	<form on:submit={signIn}>
		<InputField
			type="email"
			name="email"
			icon="logo-{name}"
			placeholder={label}
			bind:value
		/>
	</form>
{/if}
