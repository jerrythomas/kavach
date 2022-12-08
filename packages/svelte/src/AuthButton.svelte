<script>
	import { IconButton } from '@svelte-spice/form'
	import { getContext } from 'svelte'

	const kavach = getContext('kavach')
	// export let kavach
	/** @type {string} */
	export let provider
	/** @type {string} */
	export let label
	/** @type {Array<string>} */
	export let scopes = []
	/** @type {Array<string>} */
	export let params = []

	function signIn() {
		// console.log('kavach', kavach)
		kavach.adapter.auth.signInWithOAuth({
			provider,
			options: { scopes, params, redirectTo: kavach.page.auth }
		})
	}
</script>

<!-- <input type="hidden" name="provider" value={provider} />
<input type="hidden" name="scopes" value={JSON.stringify(scopes)} />
<input type="hidden" name="params" value={JSON.stringify(params)} /> -->
<IconButton on:click={signIn} {label} leftIcon="logo-{provider}" />
