<script>
	import Layers from './Layers.svelte'
</script>

<content class="flex h-full w-full flex-col md:items-center md:py-10">
	<section
		class="border-neutral-subtle min-h-content md:w-200 md:h-100 flex w-full flex-col rounded-lg border shadow-lg md:flex-row"
	>
		<aside
			class="min-h-50 from-primary to-secondary relative col-span-2 bg-gradient-to-b md:w-2/3 md:bg-gradient-to-r"
		>
			<Layers />
		</aside>
		<panel class="bg-neutral-base"> hello </panel>
	</section>
</content>
