<script>
	import { AuthProvider } from '@kavach/svelte'
	import { getContext } from 'svelte'
	import Divide from '$lib/Divide.svelte'

	const kavach = getContext('kavach')
	// export let data
	// $: console.log('kavach', kavach)
</script>

<nav class="flex flex-col flex-grow items-center p-8 gap-4">
	<section class="flex flex-col w-full px-6 gap-2 py-2">
		<AuthProvider name="google" label="Continue With Google" />
		<AuthProvider name="github" label="Continue With Github" />
		<AuthProvider name="azure" label="Continue With Azure" />
	</section>
	<Divide>or</Divide>
	<section class="flex flex-col w-full px-6 py-2">
		<AuthProvider mode="otp" name="magic" label="email for Magic Link" />
	</section>
	<Divide>or</Divide>
	<section class="flex flex-col w-full px-6 gap-2">
		<AuthProvider mode="password" name="email" label="Sign in using" />
	</section>
</nav>
