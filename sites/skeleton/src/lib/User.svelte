<script>
	import { gravatar } from '@kavach/core'

	/**
	 * @type {{ email: string; name: string; provider: string; }}
	 */
	export let value
</script>

<card class="flex gap-4 w-full p-2">
	<img src={gravatar(value.email)} alt="Gravatar for {value.email}" class="h-12 rounded-full" />
	<div class="flex flex-col relative flex-grow">
		<h1>{value.name}</h1>
		<h2>{value.email}</h2>
		<span class="absolute top-0 right-0 rounded-full bg-neutral-300 uppercase text-xs px-2">
			{value.provider}
		</span>
	</div>
</card>
