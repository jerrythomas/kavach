<script>
	import { gravatar } from '@kavach/core'

	/**
	 * @type {{ email: string; name: string; provider: string; }}
	 */
	export let content
</script>

<card class="flex gap-4 w-full p-2">
	<img
		src={gravatar(content.email)}
		alt="Gravatar for {content.email}"
		class="h-12 rounded-full"
	/>
	<div class="flex flex-col relative flex-grow">
		<h1>{content.name}</h1>
		<h2>{content.email}</h2>
		<span
			class="absolute top-0 right-0 rounded-full bg-skin-300 uppercase text-xs px-2"
		>
			{content.provider}
		</span>
	</div>
</card>
