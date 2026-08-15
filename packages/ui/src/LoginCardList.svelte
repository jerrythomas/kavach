<script>
	import LoginCard from './LoginCard.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {Array<import('./LoginCard.svelte').Props>} [logins]
	 * @property {Function} [onclick]
	 * @property {Function} [onremove]
	 */
	/** @type {Props} */
	let { logins = [], onclick, onremove } = $props()
</script>

{#each logins as login (login.email)}
	<LoginCard {...login} {onclick} {onremove} />
{/each}
