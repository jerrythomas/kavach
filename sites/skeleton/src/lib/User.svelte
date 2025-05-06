<script>
	import { gravatar } from '@kavach/core'

	/**
	 * @type {{ email: string; name: string; provider: string; }}
	 */
	export let value
</script>

<card class="flex w-full gap-4 p-2">
	<img src={gravatar(value.email)} alt="Gravatar for {value.email}" class="h-12 rounded-full" />
	<div class="relative flex flex-grow flex-col">
		<h1>{value.name}</h1>
		<h2>{value.email}</h2>
		<span class="absolute right-0 top-0 rounded-full bg-neutral-300 px-2 text-xs uppercase">
			{value.provider}
		</span>
	</div>
</card>
