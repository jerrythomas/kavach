<script>
	import { Button } from './button'

	/**
	 * @typedef {Object} Props
	 * @property {string} provider
	 * @property {string} label
	 * @property {Array<string>} [scopes] - OAuth scopes to request.
	 * @property {Function} [onclick] - Called with `{ provider, scopes }` when clicked.
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
