<script>
	import { applyAction, enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'

	export let path = '/logout'

	/** @type {import ($app/forms).SubmitFunction}*/
	const logout = async () => {
		return async ({ result }) => {
			await invalidateAll()
			// applyAction(result)
		}
	}
</script>

{#if $page.data.session}
	<form action={path} method="post" use:enhance={logout}>
		<button type="submit" class="button">Sign out</button>
	</form>
{/if}
