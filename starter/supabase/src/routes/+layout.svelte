<script>
	import 'uno.css'
	import '../app.css'

	import Header from './Header.svelte'
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { page } from '$app/stores'
	import { media, kavach } from '$lib'

	let site = writable({
		sidebar: $media.large
	})
	export let data

	setContext('site', site)
	setContext('media', media)
	setContext('kavach', kavach)

	onMount(() => kavach.onAuthChange($page.url))
</script>

<Header user={data.session?.user} title={data.title} />
<slot />
