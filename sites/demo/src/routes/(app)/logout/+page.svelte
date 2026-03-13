<script>
	import { onMount, getContext } from 'svelte'
	import { goto } from '$app/navigation'

	onMount(async () => {
		const kavach = getContext('kavach')
		if (kavach?.signOut) await kavach.signOut()
		goto('/')
	})
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-8">
	<div class="text-center">
		<h1 class="mb-4 text-2xl font-bold">Signing out...</h1>
		<p class="text-surface-z7">You will be redirected shortly.</p>
	</div>
</div>
