<script>
	import { theme } from '@rokkit/stores'
	import { Icon } from '@rokkit/atoms'
	import { Switch } from '@rokkit/organisms'

	let darkMode = false

	$: theme.set(darkMode ? 'dark' : 'light')
</script>

<header class="w-full flex flex-row items-center justify-between gap-4 bg-transparent px-12 py-6">
	<span class="flex flex-row gap-4 items-center">
		<a href="/" class="flex items-center">
			<Icon name="i-rokkit-swatch" />
		</a>
		<p>A fun personality test.</p>
	</span>
	<span class="flex flex-row items-center gap-2">
		<Switch bind:isChecked={darkMode} />
	</span>
</header>
