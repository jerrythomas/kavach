<script>
	import { AuthProvider } from '@kavach/ui'
	import { providers } from '$kavach/providers'

	let { data } = $props()
</script>

{#each providers as provider}
	<AuthProvider {provider} />
{/each}
