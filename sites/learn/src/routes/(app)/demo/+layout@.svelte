<script lang="ts">
	import 'uno.css'
	import '../../../app.css'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'

	let { children, data } = $props()
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

<div class="bg-surface-z0 text-surface-z9 min-h-screen">
	{@render children()}
</div>
