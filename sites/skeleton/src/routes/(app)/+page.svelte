<script>
	import { page } from '$app/stores'

	let menu = [
		{ icon: 'home', href: '/', label: 'Home' },
		{ icon: 'todo', href: '/todo', label: 'To do' },
		{ icon: 'lock', href: '/protected', label: 'Protected' },
		{ icon: 'unlock', href: '/public', label: 'Public' },
		{ icon: 'logout', href: '/logout', label: 'Logout' }
	]
</script>

<div class="flex flex-col flex-grow items-center py-8 gap-6 min-h-160">
	<!-- <img src="kavach.svg" alt="Kavach Logo" /> -->
	<nav class="flex flex-col w-80 leading-loose rounded-md gap-2px">
		{#each menu as { href, icon, label }}
			<a {href} class:active={$page.url.pathname === href}>
				<icon class={icon} />
				{label}
			</a>
		{/each}

		<!-- <form method="post" action={kavach.endpoint.logout} on:submit={signOut}> -->
		<!-- <button type="submit">Logout</button> -->
		<!-- </form> -->
	</nav>
</div>

<style>
	nav a,
	nav form {
		@apply px-4 py-2 bg-skin-100;
	}
	nav a:first-child {
		@apply rounded-t-md bg-skin-100;
	}
	nav form {
		@apply rounded-b-md;
	}

	.active {
		@apply bg-gradient-to-r from-primary-500 to-secondary-500 text-skin-50;
	}
</style>
