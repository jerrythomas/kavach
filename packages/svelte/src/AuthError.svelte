<script>
	export let isError = false
	export let message
	export let name
	export let status

	$: status = status ?? error_code
</script>

<error class="flex flex-col">
	<span>
		{#if status}
			{status}:
		{/if}
		{#if name}
			{name}:
		{/if}
		{message}
	</span>
	{#if message}
		<span>{message.replaceAll('+', ' ')}</span>
	{/if}
</error>
