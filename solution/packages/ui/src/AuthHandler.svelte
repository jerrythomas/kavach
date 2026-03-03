<script>
	// import { authStatus } from '@kavach/svelte'

	import AuthProvider from './AuthProvider.svelte'
	import AuthResponse from './AuthResponse.svelte'
	import AuthError from './AuthError.svelte'
	let authStatus = $state({})
	/**
	 * @typedef {Object} Props
	 * @property {import('../types).Provider[]} providers
	 */
	/** @type {Props} */
	let { providers } = $props()
</script>

<div data-auth class="flex flex-col gap-2">
	<div data-auth-header class="flex flex-col">
		{#if authStatus}
			{#if authStatus.error}
				<AuthError {...authStatus.error} />
			{:else if authStatus.message}
				<AuthResponse {...authStatus} />
			{/if}
		{/if}
	</div>

	<div data-auth-body class="flex flex-col gap-2">
		{#each providers as data (data.name)}
			<AuthProvider {...data} on:submit />
		{/each}
	</div>
</div>
