<script>
	export let error = false
	export let message = ''
</script>

{#if message.length > 0}
	<alert class="flex flex-col w-full" class:hasError={error}>
		{message}
	</alert>
{/if}
