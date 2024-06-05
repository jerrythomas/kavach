<script>
	import AuthProvider from './AuthProvider.svelte'
	export let providers
</script>

<div class="flex flex-col gap-2">
	{#each providers as data}
		<AuthProvider {...data} on:submit />
	{/each}
</div>
