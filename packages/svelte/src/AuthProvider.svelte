<script>
	import { InputField } from '@svelte-spice/form'
	import AuthButton from './AuthButton.svelte'

	/** @type {'otp'|'oauth'|'password'} */
	export let mode = 'oauth'
	/** @type {string} */
	export let name
	/** @type {string} */
	export let label = 'Continue with ' + name
	/** @type {Array<string>} */
	export let scopes = []
	/** @type {Array<string>} */
	export let params = []

	/** @type {string} */
	export let authUrl
</script>

<form method="post" action={authUrl} class="flex flex-col w-full auth {name}">
	<input type="hidden" name="mode" value={mode} />
	{#if mode === 'oauth'}
		<AuthButton provider={name} {label} {scopes} {params} />
	{:else if mode === 'password'}
		<InputField type={name} {name} icon="logo-{name}" />
		<InputField type="password" name="password" />
	{:else}
		<InputField
			type="email"
			name="email"
			icon="logo-{name}"
			placeholder={label}
		/>
	{/if}
</form>
