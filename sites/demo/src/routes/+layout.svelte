<script>
	import 'uno.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'
	import { mountKavach } from '$lib/client-kavach.js'

	let { children } = $props()

	// Placeholder instance shared with descendants via context; populated in
	// onMount so /auth and the landing page can sign users in / sync sessions.
	// `kavach-ready` gates the auth UI until the instance is hydrated so a click
	// can never land on an uninitialized instance.
	const kavach = $state({})
	const ready = $state({ value: false })
	setContext('kavach', kavach)
	setContext('kavach-ready', ready)

	onMount(async () => {
		const { instance } = await mountKavach()
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
		ready.value = true
	})
</script>

<svelte:head>
	<title>Kavach Demo</title>
	<meta name="description" content="Kavach authentication demo" />
</svelte:head>
<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-demo-theme' }} />

{@render children()}
