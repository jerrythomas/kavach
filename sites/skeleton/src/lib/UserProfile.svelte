<script>
	import { gravatar, deriveName } from '@kavach/core'

	export let email
	export let user_metadata
	export let role
	export let app_metadata

	$: avatar = gravatar(email)
	$: name = user_metadata ?? deriveName(email)
</script>

<card
	class="flex flex-row items-center bg-transparent h-24 rounded flex flex-row"
>
	<img src={avatar} alt={name.full_name} class="aspect-1 h-full  mb-4" />
	<div class="flex flex-col leading-loose gap-2 p-6">
		<h1 class="text-xl font-bold">{name.full_name}</h1>
		<h2 class="text-sm ">{role}</h2>
		<span>
			{#each app_metadata.providers as provider}
				<pill>{provider}</pill>
			{/each}
		</span>
	</div>
</card>
