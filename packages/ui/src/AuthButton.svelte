<script>
	import { Button } from './button'

	/**
	 * @typedef {Object} Props
	 * @property {string} provider
	 * @property {string} label
	 * @property {Array<string>} scopes
	 * @property {Function} onclick
	 */
	/** @type {Props} */
	let { provider, label, scopes = [], onclick } = $props()

	function handle() {
		onclick?.({ provider, scopes })
	}
</script>

<Button onclick={handle} type="button">
	<span data-item-icon class="logo-{provider}" aria-hidden="true"></span>
	<span>{label}</span>
</Button>
