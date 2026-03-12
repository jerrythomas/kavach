<script lang="ts">
	import { page } from '$app/stores'
	const platform = $derived($page.params.platform)
</script>

<div class="flex min-h-screen items-center justify-center">
	<p class="text-surface-z6">Pre-auth page for {platform} — coming soon</p>
</div>
