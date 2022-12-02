<script>
	export let error_code
	export let error
	export let error_description
</script>

<error class="flex flex-col">
	<span>
		{#if error_code}
			{error_code}:
		{/if}
		{error}
	</span>
	<span>{error_description.replaceAll('+', ' ')}</span>
</error>
