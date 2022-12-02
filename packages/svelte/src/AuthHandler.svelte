<script>
	import { page } from '$app/stores'
	import { urlHashToParams } from '@kavach/core'

	import AuthProvider from './AuthProvider.svelte'
	import AuthError from './AuthError.svelte'
	import AuthResponse from './AuthResponse.svelte'

	export let providers
	export let kavach

	$: params = Object.fromEntries($page.url.searchParams.entries())
	$: hashParams = urlHashToParams($page.url.hash)
</script>

<auth class="flex flex-col gap-2">
	<auth-header class="flex flex-col">
		<!-- {JSON.stringify(hashParams)} -->
		{#if hashParams.error}
			<AuthError {...hashParams} />
		{/if}
		<AuthResponse {...params} />
	</auth-header>

	<auth-body class="flex flex-col gap-2">
		{#each providers as data}
			<AuthProvider {...data} authUrl={kavach.endpoint.login} on:submit />
		{/each}
	</auth-body>
</auth>
