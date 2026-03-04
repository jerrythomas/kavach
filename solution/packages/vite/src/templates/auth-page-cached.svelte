<script>
	import { AuthPage } from '@kavach/ui'
	import { providers } from '$kavach/providers'

	let { data } = $props()
</script>

<AuthPage {providers} session={data.session} />
