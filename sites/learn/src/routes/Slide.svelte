<script>
	export let title
	export let image
	export let description
	export let points = []
</script>

<div class="border border-red p-4 w-full md:min-w-200 gap-2">
	<h1 class="flex py-4 text-2xl items-center">{title}</h1>
	<img src={image} alt={title} />
	<p class="py-4">{description}</p>
	<ul class="flex flex-col list-disc px-4 gap-1">
		{#each points as point}
			<li>{point}</li>
		{/each}
	</ul>
</div>
