<script>
	import { gravatar, deriveName } from '@kavach/core'

	let { email, full_name, role, avatar_url, app_metadata } = $props()

	let avatar = $derived(avatar_url ?? gravatar(email))
	let name = $derived(full_name ?? deriveName(email).full_name)
</script>

<card class="flex flex h-24 flex-row flex-row items-center rounded bg-transparent">
	<img src={avatar} alt={name} class="aspect-1 mb-4 h-full" />
	<div class="flex flex-col gap-2 p-6 leading-loose">
		<h1 class="text-xl font-bold">{name}</h1>
		<h2 class="text-sm capitalize">{role}</h2>
		{#if app_metadata?.providers}
			<span class="flex flex-wrap gap-2">
				{#each app_metadata.providers as provider (provider)}
					<pill class="bg-secondary-200 rounded-full px-4 py-1 text-xs uppercase">{provider}</pill>
				{/each}
			</span>
		{/if}
	</div>
</card>
