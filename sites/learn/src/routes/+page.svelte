<script>
	import Slide from './Slide.svelte'
	export let data
</script>

<main class="h-full w-full flex flex-col p-8">
	<demo class="flex flex-col p-10 gap-4 mx-auto">
		<Slide {...data.slides[0]} />
	</demo>
</main>
