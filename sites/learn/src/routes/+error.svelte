<script>
	import { page } from '$app/stores'
</script>

<div class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-8">
	<div class="max-w-md text-center">
		<h1 class="text-4xl font-bold text-surface-z9 mb-4">404</h1>
		<h2 class="text-xl font-semibold text-surface-z8 mb-4">Page Not Found</h2>
		<p class="text-surface-z7 mb-8">
			The page you're looking for doesn't exist or has been moved.
		</p>
		<p class="text-surface-z6 mb-8 text-sm">
			Requested: {$page.url.pathname}
		</p>
		<a
			href="/"
			class="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-z6 transition-colors"
		>
			Go Home
		</a>
	</div>
</div>
