<script>
	import 'uno.css'
	import '../app.css'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'
	import { authStatus } from '@kavach/svelte'
	import { setContext } from 'svelte'
	import { page } from '$app/stores'
	import { Alerts } from '@rokkit/core'
	import { alerts } from '@rokkit/core/stores'

	import { dataTheme } from '$lib/theme'

	setContext('kavach', kavach)
	onMount(() => kavach.onAuthChange($page.url))

	$: if ($authStatus) alerts.set([...$alerts, $authStatus])
</script>

<Alerts />
<main class="flex flex-col w-full h-full relative bg-skin-50" use:dataTheme>
	<slot />
</main>
