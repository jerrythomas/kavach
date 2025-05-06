<script>
	import { Button, InputField, Icon } from '@rokkit/ui'
	import { getContext } from 'svelte'
	import AuthPassword from './AuthPassword.svelte'

	const kavach = getContext('kavach')

	/**
	 * @typedef {Object } Props
	 * @property {string} class
	 * @property {'otp'|'oauth'|'password'} mode
	 * @property {string} name
	 * @property {string} label
	 * @property {Array<string>} scopes
	 * @property {string} value
	 * @property {string} password
	 * @property {Object} result
	 * @property {Function} onerror
	 * @property {Function} onsubmit
	 */
	/** @type {Props} */
	let {
		class: className = '',
		mode = 'oauth',
		name,
		label,
		scopes = [],
		onerror,
		onsubmit
	} = $props()

	let result
	let value = $state(null)
	let password = $state(null)

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
				onerror?.(result.error)
			} else {
				onsucces?.(result.data)
			}
		}
	}
</script>

{#if mode === 'oauth'}
	<Button onclick={signIn} {label} leftIcon="i-auth-{name}" class={className} />
{:else if mode === 'password'}
	<AuthPassword bind:value bind:password onclick={signIn} />
{:else}
	<form onsubmit={signIn} class="flex w-full p-0 {className}">
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
