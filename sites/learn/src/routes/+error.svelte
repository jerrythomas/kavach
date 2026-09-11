<script>
	import { page } from '$app/stores'
</script>

<div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-8">
	<div class="max-w-md text-center">
		<h1 class="text-surface-z9 mb-4 text-4xl font-bold">404</h1>
		<h2 class="text-surface-z8 mb-4 text-xl font-semibold">Page Not Found</h2>
		<p class="text-surface-z7 mb-8">The page you're looking for doesn't exist or has been moved.</p>
		<p class="text-surface-z6 mb-8 text-sm">
			Requested: {$page.url.pathname}
		</p>
		<a
			href="/"
			class="bg-primary text-on-primary hover:bg-primary-z6 rounded-lg px-6 py-3 font-medium transition-colors"
		>
			Go Home
		</a>
	</div>
</div>
