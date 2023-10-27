<script>
	import { theme } from '@rokkit/stores'
	import { defaultStateIcons } from '@rokkit/core'
	import { Select } from '@rokkit/organisms'
	import { Icon } from '@rokkit/atoms'

	const modeIcons = defaultStateIcons.mode

	export let palettes = [
		{ title: 'Vibrant Day', name: 'vibrant-day' },
		{ title: 'Calm Seas', name: 'calm-seas' },
		{ title: 'Purple-Dream', name: 'purple-dream' }
	]
	export let themes = [
		{ title: 'Rokkit', name: 'rokkit' },
		{ title: 'Minimal', name: 'minimal' },
		{ title: 'Material', name: 'material' }
	]

	// let currentTheme

	$: current = $theme
	$: currentTheme = themes.find((theme) => theme.name === current.name)
	$: currentPalette = palettes.find((palette) => palette.name === current.palette)

	function toggleMode() {
		const mode = current.mode === 'dark' ? 'light' : 'dark'
		theme.set({ ...current, mode })
	}

	function handleThemeChange(event) {
		theme.set({ ...current, name: event.detail.name })
	}
	function handlePaletteChange(event) {
		theme.set({ ...current, palette: event.detail.name })
	}
</script>

<Select
	options={palettes}
	value={currentPalette}
	fields={{ text: 'title', value: 'name' }}
	on:select={handlePaletteChange}
/>
<Select
	options={themes}
	value={currentTheme}
	fields={{ text: 'title', value: 'name' }}
	on:select={handleThemeChange}
/>
<theme-mode role="switch" aria-checked={current.mode === 'dark'} class="flex p-0">
	<Icon name={modeIcons[current.mode]} role="button" on:click={toggleMode} />
</theme-mode>
