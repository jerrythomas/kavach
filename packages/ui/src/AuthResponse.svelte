<script>
	/**
	 * @typedef {Object}Props
	 * @property {boolean} error
	 * @property {string}  message
	 */
	/** @type {Props}  */
	let { error = false, message = '' } = $props()
</script>

{#if message.length > 0}
	<div data-alert class="flex w-full flex-col" class:hasError={error}>
		{message}
	</div>
{/if}
