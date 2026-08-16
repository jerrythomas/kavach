<script>
	import { vibe } from '@rokkit/states'
	import { Toggle } from '@rokkit/ui'

	let { densities = ['comfortable', 'compact', 'cozy'], class: className = '' } = $props()

	let value = $derived(vibe.density)

	/** @param {unknown} newValue */
	function handleChange(newValue) {
		vibe.density = /** @type {string} */ (newValue)
	}
</script>

<Toggle
	variant="group"
	options={densities}
	{value}
	showLabels
	size="sm"
	label="Density"
	onchange={handleChange}
	class={className}
/>
