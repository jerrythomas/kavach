<script>
	import AuthProvider from './AuthProvider.svelte'
	/**
	 * @typedef {Object} Props
	 * @property {import('../types).Provider[]} providers
	 */
	/** @type {Props} */
	let { providers } = $props()
</script>

<div class="flex flex-col gap-2">
	{#each providers as data (data.name)}
		<AuthProvider {...data} on:submit />
	{/each}
</div>
