<script>
	import 'uno.css'
	import '../app.css'
	import { onMount, setContext } from 'svelte'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'

	import { adjustViewport } from '@rokkit/core'
	// import { alerts } from '@rokkit/stores'
	import { themable } from '@rokkit/actions'
	import { Alerts } from '@rokkit/molecules'

	import { authStatus } from '@kavach/svelte'
	import { kavach, media } from '$lib'

	setContext('kavach', kavach)
	setContext('media', media)

	onMount(() => kavach.onAuthChange($page.url))

	$: adjustViewport(browser, $media.small)
	// $: if ($authStatus) alerts.info($authStatus)
	$: console.log($authStatus)
</script>

<svelte:body use:themable />
<Alerts />

<slot />
