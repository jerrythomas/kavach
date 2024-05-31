<script>
	import AuthProvider from './AuthProvider.svelte'
	export let providers
	export let authUrl
</script>

<div class="flex flex-col gap-2">
	{#each providers as data}
		<AuthProvider {...data} {authUrl} on:submit />
	{/each}
</div>
