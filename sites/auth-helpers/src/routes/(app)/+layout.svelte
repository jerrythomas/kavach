<script>
	import { kavach } from '$lib/auth'
	import { Logout } from '@kavach/svelte'
</script>

<header
	class="flex flex-row leading-loose px-4 py-2 gap-4 items-center justify-between"
>
	<div class="flex">
		<b>Supabase Auth Helpers Demo</b>
	</div>
	<div class="navbar-end">
		<Logout path={kavach.endpoint.logout} />
		<!-- {#if $page.data.session}
			<form action={kavach.endpoint.logout} method="post" on:submit={logout}>
				<button type="submit" class="button">Sign out</button>
			</form>
		{/if} -->
	</div>
</header>
<content class="flex flex-col flex-grow p-8 items-center overflow-y-auto">
	<slot />
</content>
