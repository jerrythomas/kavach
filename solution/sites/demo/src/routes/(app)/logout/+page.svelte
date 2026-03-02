<script>
	import { getContext, onMount } from 'svelte'

	onMount(async () => {
		const kavach = getContext('kavach')
		if (kavach) await kavach.signOut()
	})
</script>

<p class="m-auto text-lg">Logging out...</p>
