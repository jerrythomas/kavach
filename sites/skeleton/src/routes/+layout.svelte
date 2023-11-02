<script>
	import 'uno.css'
	import '../app.css'
	import { onMount, setContext } from 'svelte'
	import { page } from '$app/stores'
	// import { alerts } from '@rokkit/stores'
	import { themable } from '@rokkit/actions'
	import { Alerts } from '@rokkit/molecules'

	import { kavach, media } from '$lib'
	import Header from '$lib/Header.svelte'

	export let data
	setContext('kavach', kavach)
	setContext('media', media)

	onMount(() => kavach.onAuthChange($page.url))

</script>

<svelte:body use:themable />
<Header version={data.version} />
<Alerts />

<slot />
