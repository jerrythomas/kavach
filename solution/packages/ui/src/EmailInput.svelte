<script>
	let { value = $bindable(''), onclick } = $props()

	function handle() {
		onclick({ value })
	}
</script>

<input type="email" bind:value />
<button onclick={handle}>Send</button>
