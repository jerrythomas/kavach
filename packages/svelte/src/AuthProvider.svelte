<script>
	import { InputField } from '@svelte-spice/form'
	import AuthButton from './AuthButton.svelte'

	/** @type {'otp'|'oauth'|'password'} */
	export let mode = 'oauth'
	/** @type {string} */
	export let name
	/** @type {string} */
	export let label
	/** @type {Array<string>} */
	export let scopes = []
	/** @type {Array<string>} */
	export let params = []

	/** @type {string} */
	export let action = null
</script>

{#if mode === 'oauth'}
	<AuthButton provider={name} {label} {scopes} {params} />
{:else}
	<form method="post" {action} class="flex flex-col w-full auth {name}">
		<input type="hidden" name="mode" value={mode} />
		{#if mode === 'password'}
			<InputField type={name} {name} icon="logo-{name}" {label} />
			<InputField type="password" name="password" label="Password" />
			<button
				on:click
				class="col-start-3 text-center h-10 mt-4 bg-primary text-white"
			>
				Sign in
			</button>
		{:else}
			<InputField
				type="email"
				name="email"
				icon="logo-{name}"
				placeholder={label}
			/>
		{/if}
	</form>
{/if}
