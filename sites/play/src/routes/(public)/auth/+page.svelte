<script>
	import { onMount } from 'svelte'
	import { kavach } from '$lib/config'
	import { AuthHandler } from '@kavach/svelte'
	import { providers } from '$lib/config'

	onMount(async () => {
		// console.log('layout', $page.url.hash)
		await kavach.onAuthChange()
	})
</script>

<content class="p-8 flex flex-col flex-grow gap-4 justify-center items-center">
	<AuthHandler {providers} {kavach} />
</content>
