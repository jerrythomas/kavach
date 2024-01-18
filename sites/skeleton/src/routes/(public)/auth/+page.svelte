<script>
	import { AuthProvider } from '@kavach/svelte'
	// import { getContext } from 'svelte'
	// import Divide from '$lib/Divide.svelte'
	import { urlHashToParams } from '@kavach/core'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	export let error = {}
	export let response = null
	let providers = [
		{
			name: 'google',
			label: 'Continue With Google'
		},
		{
			name: 'github',
			label: 'Continue With Github'
		},
		{
			name: 'azure',
			label: 'Continue With Azure',
			scopes: ['email', 'profile']
		},
		{
			mode: 'otp',
			name: 'magic',
			label: 'email for Magic Link'
		},
		{
			mode: 'password',
			name: 'email',
			label: 'Sign in using'
		}
	]
	onMount(() => {
		error = urlHashToParams($page.url.hash)
	})

	function handleError(event) {
		error = event.detail
	}
	function handleSuccess(event) {
		response = event.detail
	}
</script>

<!--  -->
<nav class="flex flex-col flex-grow items-center p-8 gap-2">
	<section class="flex flex-col w-full gap-2 py-2">
		{#each providers as provider}
			{#if ['google', 'github', 'azure'].includes(provider.name)}
				<AuthProvider {...provider} on:success={handleSuccess} on:error={handleError} />
			{/if}
		{/each}
		<!-- <AuthProvider name="google" label="Continue With Google" /> -->
		<!-- <AuthProvider name="github" label="Continue With Github" /> -->
		<!-- <AuthProvider name="azure" label="Continue With Azure" scopes={['email']} /> -->
	</section>
	<!-- <Divide>or</Divide> -->
	<section class="flex flex-col w-full py-2">
		<AuthProvider
			mode="otp"
			name="magic"
			label="email for Magic Link"
			on:success={handleSuccess}
			on:error={handleError}
		/>
	</section>
	<!-- <Divide>or</Divide> -->
	<section class="flex flex-col w-full gap-2">
		<AuthProvider mode="password" name="email" label="Sign in using" />
	</section>
</nav>
