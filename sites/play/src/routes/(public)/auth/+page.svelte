<script>
	import { AuthGroup } from '@kavach/svelte'
	import { providers } from '$lib/config'
	import { page } from '$app/stores'
	/** @type {import('./$types').PageData} */
	export let data

	console.log('page data', $page)
</script>

<content class="p-8 flex flex-col flex-grow gap-4 justify-center items-center">
	{#if data.params.error && data.params.error !== 'null'}
		<error>
			{data.params.error}
		</error>
	{:else if data.params.email}
		<info>
			Magic link has been sent to {data.params.email}
		</info>
	{/if}
	<div class="flex flex-col w-80">
		<AuthGroup {providers} authUrl="/auth/signin" />
	</div>
</content>
