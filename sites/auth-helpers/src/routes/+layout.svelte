<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'

	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'

	onMount(() => {
		// kavach.handleAuthChange()
		const {
			data: { subscription }
		} = kavach.client.auth.onAuthStateChange(() => {
			invalidate('supabase:auth')
		})

		return () => {
			subscription.unsubscribe()
		}
	})
</script>

<svelte:head>
	<title>Kavach Demo</title>
</svelte:head>
<slot />
