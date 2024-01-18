<script>
	import Switch from '$lib/Switch.svelte'
	import DropDown from '$lib/DropDown.svelte'
	import { theme } from '$lib/theme'

	let darkMode = false
	let items = [{ text: 'Modern' }, { text: 'Material' }]
	let value = items[0]
	$: theme.set(darkMode ? 'dark' : 'light')
</script>

<header
	class="w-full flex flex-row items-center justify-between gap-4 bg-transparent px-12 py-6"
>
	<span class="flex flex-row gap-4 items-center">
		<a href="/" class="flex items-center">
			<Icon name="i-rokkit-swatch" />
		</a>
		<p>A fun personality test.</p>
	</span>
	<span class="flex flex-row items-center gap-2">
		<DropDown {items} bind:value />
		<Switch bind:isChecked={darkMode} />
	</span>
</header>
