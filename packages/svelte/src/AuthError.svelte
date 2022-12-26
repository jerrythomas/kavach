<script>
	export let error_code
	export let error
	export let error_description
	export let name
	export let status

	$: status = status ?? error_code
</script>

{#if error}
	<error class="flex flex-col">
		<span>
			{#if status}
				{status}:
			{/if}
			{#if name}
				{name}:
			{/if}
			{error}
		</span>
		{#if error_description}
			<span>{error_description.replaceAll('+', ' ')}</span>
		{/if}
	</error>
{/if}
