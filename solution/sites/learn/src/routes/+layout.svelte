<script>
	import 'uno.css'
	import '../app.css'
	import { ToggleThemeMode } from '@rokkit/ui'
	import { themable } from '@rokkit/actions'

	const title = 'Kavach'
</script>

<svelte:body use:themable />
<svelte:head>
	<title>{title}</title>
	<meta name="description" content="An authentication library" />
</svelte:head>
<header class="flex w-full justify-between px-8 py-2 border-b border-neutral-inset items-center">
	<h1 class="text-xl font-bold">{title}</h1>
	<ToggleThemeMode />
</header>
<slot />
