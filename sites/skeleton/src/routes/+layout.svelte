<script>
	import 'uno.css'
	import '../app.css'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'
	import { browser } from '$app/environment'
	import { media } from '$lib'
	import { authStatus } from '@kavach/svelte'
	import { setContext } from 'svelte'
	import { page } from '$app/stores'
	import { Alerts } from '@rokkit/molecules'
	import { alerts } from '@rokkit/stores'
	import { adjustViewport } from '@rokkit/core'
	import { themable } from '@rokkit/actions'

	setContext('kavach', kavach)
	onMount(() => kavach.onAuthChange($page.url))

	$: adjustViewport(browser, $media.small)
	$: if ($authStatus) alerts.set([...$alerts, $authStatus])
</script>
<svelte:body use:themable />
<Alerts />
<!-- <main class="flex flex-col w-full h-full relative bg-skin-900" >
	<slot />
</main> -->
