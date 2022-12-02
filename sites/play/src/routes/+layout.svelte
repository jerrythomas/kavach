<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/config'
	import About from './About.svelte'

	onMount(async () => {
		await kavach.onAuthChange()
	})
</script>

<aside class="flex bg-primary w-1/2 p-8 items-center justify-center">
	<About />
</aside>
<main class="flex flex-col flex-grow">
	<slot />
</main>
