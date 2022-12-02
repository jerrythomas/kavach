<script lang="ts">
	// import { applyAction, enhance } from '$app/forms'
	// import { invalidateAll } from '$app/navigation'
	// import { page } from '$app/stores'

	// /** @type {import ($app/forms).SubmitFunction}*/
	// const logout = () => {
	// 	return async ({ result }) => {
	// 		await invalidateAll()
	// 		applyAction(result)
	// 	}
	// }
</script>

<main class="flex flex-col p-8">
	<!-- <div class="navbar-menu my-4">
		<div class="navbar-start">
			<a class="my-2" href="/">Supabase Auth Helpers Demo</a>
		</div>
		<div class="navbar-end">
			{#if $page.data.session}
				<form action="/logout" method="post" use:enhance={logout}>
					<button type="submit" class="button">Sign out</button>
				</form>
			{/if}
		</div>
	</div> -->
	<slot />
</main>
