<script>
	import { kavach, logger } from '$lib/auth'
	import { invalidateAll } from '$app/navigation'

	export let data

	$: user = data.session?.user
	let provider = 'azure'
	function signIn() {
		const result = kavach.adapter.auth.signInWithOAuth({
			provider,
			options: {
				// scopes, params, redirectTo: kavach.page.auth
			}
		})
		logger.debug({
			message: 'auth result',
			method: 'signIn',
			module: '/layout.svelte',
			data: { provider, result }
		})
		invalidateAll()
	}
</script>

<content
	class="flex flex-row w-full my-auto border border-skin-200 rounded-md shadow-lg max-h-screen overflow-scroll"
>
	<aside
		class="flex flex-col bg-skin-zebra p-6 gap-2 rounded-l-md border-r border-skin-200 "
	>
		<h1 class="text-lg">Session data</h1>
		<pre class=" border-rounded border p-4 overflow-scroll">{JSON.stringify(
				user,
				null,
				2
			)}</pre>
	</aside>
	<slot />
</content>
