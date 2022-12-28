<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'
	import { setContext } from 'svelte'
	import { page } from '$app/stores'

	const status = kavach.status
	setContext('kavach', kavach)
	onMount(() => kavach.onAuthChange($page.url))
</script>

<pre>
	status:{JSON.stringify($status, null, 2)}
</pre>
<main
	class="flex flex-col items-center justify-center w-full h-full lg:max-w-screen-lg m-auto py-14 "
>
	<slot />
</main>
