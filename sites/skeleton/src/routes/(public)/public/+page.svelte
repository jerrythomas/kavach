<script>
	import Layers from './Layers.svelte'
</script>
<content class="flex flex-col w-full h-full md:items-center md:py-10">
	<section class="flex flex-col md:flex-row  border border-skin-subtle rounded-lg shadow-lg w-full min-h-content md:w-200 md:h-100 ">
		<aside class="col-span-2 relative md:w-2/3 min-h-50 bg-gradient-to-b md:bg-gradient-to-r from-primary to-secondary">
      <Layers  />
		</aside>
		<panel class="bg-skin-base">
      hello
		</panel>
	</section>
</content>
