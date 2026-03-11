<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	onMount(() => {
		// Sign out logic will be added when we integrate Kavach
		setTimeout(() => {
			goto('/demo')
		}, 1000)
	})
</script>

<div class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-8">
	<div class="text-center">
		<h1 class="text-2xl font-bold mb-4">Signing out...</h1>
		<p class="text-surface-z7">You will be redirected shortly.</p>
	</div>
</div>
