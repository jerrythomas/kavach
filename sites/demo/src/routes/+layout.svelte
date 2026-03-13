<script>
	import 'uno.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'

	let { children } = $props()
</script>

<svelte:head>
	<title>Kavach Demo</title>
	<meta name="description" content="Kavach authentication demo" />
</svelte:head>
<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-demo-theme' }} />

{@render children()}
