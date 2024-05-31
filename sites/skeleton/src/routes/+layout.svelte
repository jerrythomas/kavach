<script>
	import 'uno.css'
	import '../app.css'
	import { onMount, setContext } from 'svelte'
	import { themable } from '@rokkit/actions'
	import { Alerts } from '@rokkit/molecules'
	import { alerts } from '@rokkit/stores'
	import { authStatus } from '@kavach/svelte'
	import { kavach, media } from '$lib'
	import Header from '$lib/Header.svelte'

	setContext('kavach', kavach)
	setContext('media', media)

	export let data

	authStatus.subscribe((value) => {
		const { type, error, message } = value ?? {}
		if (error) alerts.danger(error.message)
		else if (message) alerts.send(message, type)
	})

	onMount(() => kavach.onAuthChange())
</script>

<svelte:body use:themable />
<Header version={data.version} />
<Alerts />

<slot />
