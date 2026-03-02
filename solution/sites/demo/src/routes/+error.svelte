<script>
	import { page } from '$app/state'
	import { getContext, onMount } from 'svelte'

	onMount(() => {
		const logger = getContext('logger')
		if (logger && $page.error) {
			const contextLogger = logger.getContextLogger({ module: 'error-page' })
			contextLogger.error({
				message: $page.error.message,
				data: {
					status: $page.status,
					url: $page.url?.pathname
				}
			})
		}
	})
</script>

<div class="flex items-center justify-center min-h-[50vh]">
	<div class="text-center">
		<h1 class="text-6xl font-bold text-neutral-300">{$page.status}</h1>
		<p class="mt-4 text-neutral-600">{$page.error?.message ?? 'Something went wrong'}</p>
		<a href="/" class="mt-8 inline-block text-blue-600 hover:underline">Go home</a>
	</div>
</div>
