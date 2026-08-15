<script>
	import { Button } from '@rokkit/ui'
	import { InputField } from '@rokkit/forms'
	import { getContext } from 'svelte'
	import AuthPassword from './AuthPassword.svelte'

	const kavach = getContext('kavach')

	/**
	 * @typedef {Object} Props
	 * @property {string} [class] - The class to apply to the container.
	 * @property {'otp'|'oauth'|'password'} [mode] - The sign-in mode. Defaults to `oauth`.
	 * @property {string} name - The provider name (also used as the OAuth icon name).
	 * @property {string} label - The label shown on the sign-in button.
	 * @property {Array<string>} [scopes] - OAuth scopes to request.
	 * @property {string} [value] - The email/phone input value.
	 * @property {string} [password] - The password input value.
	 * @property {Function} [onerror] - Called with the error when sign-in fails.
	 * @property {Function} [onsuccess] - Called with the data when sign-in succeeds.
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

<div data-auth data-auth-provider={name} data-auth-mode={mode} class="flex flex-col gap-2">
	{#if mode === 'oauth'}
		<Button onclick={signIn} data-auth-provider={name} style="none">
			<span data-item-icon class="i-auth-{name}" aria-hidden="true"></span>
			<span data-item-label>{label}</span>
		</Button>
	{:else if mode === 'password'}
		<AuthPassword bind:value bind:password onclick={signIn} />
	{:else}
		<form
			onsubmit={(e) => {
				e.preventDefault()
				signIn()
			}}
			class="flex w-full flex-col gap-2 {className}"
		>
			<InputField
				type="email"
				name="magic"
				label="magic link"
				icon="i-auth-{name}"
				placeholder={label}
				bind:value
			/>
			<Button type="submit" data-auth-provider={name}>{label}</Button>
		</form>
	{/if}
</div>
