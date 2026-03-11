<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} email
	 * @property {string} name
	 * @property {string} avatar
	 * @property {string} provider
	 * @property {string} mode
	 * @property {boolean} hasPasskey
	 * @property {Function} onclick
	 * @property {Function} onremove
	 */
	/** @type {Props} */
	let { email, name, avatar, provider, mode, hasPasskey = false, onclick, onremove } = $props()

	function handleClick() {
		onclick?.({ email, provider, mode })
	}

	function handleRemove(e) {
		e.stopPropagation()
		onremove?.(email)
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div data-login-card onclick={handleClick} role="button" tabindex="0">
	<img src={avatar} alt={name} />
	<span>{name}</span>
	<span data-provider={provider} aria-hidden="true"></span>
	{#if hasPasskey}
		<span data-passkey aria-hidden="true"></span>
	{/if}
	<button type="button" data-remove onclick={handleRemove}>x</button>
</div>
