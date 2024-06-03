<script>
	import { Button } from '@rokkit/molecules'
	import { InputField } from '@rokkit/organisms'
	import { getContext } from 'svelte'
	import { createEventDispatcher } from 'svelte'
	import AuthPassword from './AuthPassword.svelte'

	const dispatch = createEventDispatcher()
	const kavach = getContext('kavach')

	let className = ''
	export { className as class }
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
			await kavach.signIn({
				provider: name,
				scopes
			})
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
	<Button
		on:click={signIn}
		{label}
		leftIcon="i-auth-{name}"
		class={className}
	/>
{:else if mode === 'password'}
	<AuthPassword bind:value bind:password on:click={signIn} />
{:else}
	<form on:submit={signIn} class="flex w-full p-0 {className}">
		<InputField
			type="email"
			name="magic"
			label="magic link"
			icon="i-auth-{name}"
			placeholder={label}
			bind:value
		/>
	</form>
{/if}
