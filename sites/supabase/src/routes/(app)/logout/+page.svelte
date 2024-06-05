<script>
	import { kavach } from '$lib/auth'
	import { onMount } from 'svelte'

	onMount(async () => {
		await kavach.signOut()
	})
</script>

<p class="m-auto text-lg">Logging out...</p>
