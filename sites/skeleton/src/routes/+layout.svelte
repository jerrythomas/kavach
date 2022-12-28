<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'
	import { authStatus } from '@kavach/svelte'
	import { setContext } from 'svelte'
	import { page } from '$app/stores'
	import { Alerts } from '@svelte-spice/core'
	import { alerts } from '@svelte-spice/core/stores'

	setContext('kavach', kavach)
	onMount(() => kavach.onAuthChange($page.url))

	$: if ($authStatus) alerts.set([...$alerts, $authStatus])
</script>

<Alerts />
<main
	class="flex flex-col items-center justify-center w-full h-full lg:max-w-screen-lg m-auto py-14 "
>
	<slot />
</main>
