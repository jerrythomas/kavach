<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} message
	 * @property { string} name
	 * @property {string} status
	 */
	/** @type {Props} */
	let { message, name = null, status = null } = $props()
</script>

<div data-error class="flex flex-col">
	<span>
		{#if status}
			{status}:
		{/if}
		{#if name}
			{name}:
		{/if}
		{message}
	</span>
</div>
