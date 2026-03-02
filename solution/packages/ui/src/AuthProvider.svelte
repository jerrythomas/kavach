<script>
	import { Button } from './button'
	import { InputField } from '@rokkit/forms'
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
	 * @property {Function} onsuccess
	 */
	/** @type {Props} */
	let {
		class: className = '',
		mode = 'oauth',
		name,
		label,
		scopes = [],
		value = $bindable(''),
		password = $bindable(''),
		onerror,
		onsuccess
	} = $props()

	let result

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
				onsuccess?.(result.data)
			}
		}
	}
</script>

{#if mode === 'oauth'}
	<Button onclick={signIn} type="button" class={className}>
		<span data-item-icon class="i-auth-{name}" aria-hidden="true"></span>
		<span>{label}</span>
	</Button>
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
