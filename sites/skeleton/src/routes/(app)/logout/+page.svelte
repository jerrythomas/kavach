<script>
	import { kavach } from '$lib/auth'
	import { onMount } from 'svelte'

	onMount(async () => {
		await kavach.signOut()
	})
</script>
