<script>
	import { kavach } from '$lib/auth'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	onMount(async () => {
		await kavach.signOut()
		goto('/auth')
	})
</script>
