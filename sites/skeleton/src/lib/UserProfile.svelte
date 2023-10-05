<script>
	import { gravatar, deriveName } from '@kavach/core'

	export let email
	export let full_name
	export let role
	export let avatar_url
	export let app_metadata

	$: avatar = avatar_url ?? gravatar(email)
	$: name = full_name ?? deriveName(email).full_name
</script>

<card
	class="flex flex-row items-center bg-transparent h-24 rounded flex flex-row"
>
	<img src={avatar} alt={name} class="aspect-1 h-full  mb-4" />
	<div class="flex flex-col leading-loose gap-2 p-6">
		<h1 class="text-xl font-bold">{name}</h1>
		<h2 class="text-sm capitalize">{role}</h2>
		{#if app_metadata?.providers}
		<span class="flex flex-wrap gap-2">
			{#each app_metadata.providers as provider}
				<pill class="rounded-full text-xs px-4 py-1 bg-secondary-200 uppercase"
					>{provider}</pill
				>
			{/each}
		</span>
		{/if}
	</div>
</card>
