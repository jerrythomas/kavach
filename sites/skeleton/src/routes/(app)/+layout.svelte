<script>
	export let data
</script>

<content
	class="flex flex-row w-full my-auto border border-skin-200 rounded-md shadow-lg"
>
	<aside
		class="flex flex-col flex-grow bg-skin-zebra p-6 gap-2 rounded-l-md border-r border-skin-200"
	>
		<h1 class="text-lg">Session data</h1>
		<pre class=" border-rounded border p-4">{JSON.stringify(
				data,
				null,
				2
			)}</pre>
	</aside>
	<slot />
</content>
