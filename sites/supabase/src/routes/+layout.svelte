<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { kavach, logger } from '$lib/session'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	/** @type {import('./$types').LayoutData} */
	export let data
	onMount(async () => {
		await logger.debug({
			module: './layout.svelte',
			method: 'onMount',
			url_path: $page.url.pathname,
			data,
			message: 'before calling kavach.onAuthChange'
		})
		await kavach.onAuthChange()
	})
</script>

<slot />
