<script>
	import { AuthProvider } from '@kavach/svelte'
	import { getContext } from 'svelte'
	const kavach = getContext('kavach')
	// export let data
	// $: console.log('kavach', kavach)
</script>

<nav class="flex flex-col flex-grow items-center p-8">
	<section class="flex flex-col w-full px-6 gap-2">
		<AuthProvider name="google" label="Continue With Google" />
		<AuthProvider name="github" label="Continue With Github" />
		<AuthProvider
			name="azure"
			params={[{ prompt: 'consent', domain_hint: 'organizations' }]}
			label="Continue With Azure"
		/>
	</section>
	<section class="flex flex-col m-4">
		<AuthProvider
			action={kavach.endpoint.login}
			name="magic"
			label="email for Magic Link"
		/>
	</section>
	<section class="flex flex-col m-4">
		<AuthProvider
			action={kavach.endpoint.login}
			name="email"
			label="Sign in email"
		/>
	</section>
</nav>
