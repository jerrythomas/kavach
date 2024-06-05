<script>
	import { authStatus } from '../kavach'

	import AuthProvider from './AuthProvider.svelte'
	import AuthResponse from './AuthResponse.svelte'
	import AuthError from './AuthError.svelte'

	export let providers
</script>

<auth class="flex flex-col gap-2">
	<auth-header class="flex flex-col">
		{#if $authStatus}
			{#if $authStatus.error}
				<AuthError {...$authStatus.error} />
			{:else if $authStatus.message}
				<AuthResponse {...$authStatus} />
			{/if}
		{/if}
	</auth-header>

	<auth-body class="flex flex-col gap-2">
		{#each providers as data}
			<AuthProvider {...data} on:submit />
		{/each}
	</auth-body>
</auth>
