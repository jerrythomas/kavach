<script lang="ts">
	import { page } from '$app/stores'
	let { data } = $props()
	const platform = $derived($page.params.platform)
</script>

<div class="p-8">
	<h1>Dashboard — {platform}</h1>
	<p>Signed in as {(data as any).user?.email}</p>
</div>
