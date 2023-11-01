<script>
	import { Button } from '@rokkit/molecules'
	import { InputField } from '@rokkit/organisms'
	import { getContext } from 'svelte'
	import { createEventDispatcher } from 'svelte'
  import AuthPassword from './AuthPassword.svelte'

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
  <Button on:click={signIn} {label} leftIcon="i-auth-{name}" />
{:else if mode === 'password'}

	<!-- <InputField name="email" type={name} icon="i-auth-{name}" label={name} autocomplete="on" bind:value />
	<InputField
	  name="password"
		type="password"
		icon="i-auth-password"
		label="Password"
		bind:password
	/>
	<button
		on:click={signIn}
		class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
	>
		Sign in
	</button> -->
	<AuthPassword bind:value bind:password on:click={signIn} />
{:else}
	<form on:submit={signIn} class="flex w-full p-0">
		<InputField
			type="email"
			name="magic"
			icon="i-auth-{name}"
			placeholder={label}
			bind:value
		/>
	</form>
{/if}
