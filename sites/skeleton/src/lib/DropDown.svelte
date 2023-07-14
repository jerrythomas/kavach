<script>
	import Icon from './Icon.svelte'
	import { List, defaultFields, Text } from '@rokkit/core'
	import { dismissable } from '@rokkit/core/actions'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = defaultFields
	export let using = { default: Text }
	export let value = null
	export let placeholder = 'Select a value'

	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }

	let offsetTop = 0
	let open = false

	function handleSelect(event) {
		open = false
		dispatch('change', event.detail)
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
	class="flex flex-shrink-0 flex-grow relative cursor-pointer dropdown"
	class:open
	tabindex="0"
	use:dismissable
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
>
	<button
		on:click|stopPropagation={() => (open = !open)}
		class="flex min-w-fit w-full "
		bind:clientHeight={offsetTop}
		tabindex="-1"
	>
		<svelte:component this={using.default} content={value ?? placeholder} />
		<Icon name="dropdown-opened" />
	</button>
	{#if open}
		<div
			class="flex flex-col absolute z-10 h-fit w-full menu"
			style:top="{offsetTop}px"
		>
			<List
				{items}
				{fields}
				{using}
				bind:activeItem={value}
				on:select={handleSelect}
			/>
		</div>
	{/if}
</div>
