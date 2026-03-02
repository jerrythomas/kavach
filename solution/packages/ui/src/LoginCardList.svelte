<script>
	import LoginCard from './LoginCard.svelte'
	let { logins = [], onclick, onremove } = $props()
</script>

{#each logins as login (login.email)}
	<LoginCard {...login} {onclick} {onremove} />
{/each}
