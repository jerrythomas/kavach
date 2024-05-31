<script>
	export let message
	export let name = null
	export let status = null
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
</error>
