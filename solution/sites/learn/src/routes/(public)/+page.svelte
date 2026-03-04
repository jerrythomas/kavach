<script lang="ts">
</script>

<main class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-8">
	<div class="max-w-4xl mx-auto text-center space-y-8">
		<h1 class="text-5xl font-bold text-surface-z9">Kavach</h1>
		<p class="text-2xl text-surface-z8">Authentication made simple</p>
		
		<p class="text-lg text-surface-z7 max-w-2xl mx-auto">
			A drop-in authentication framework for SvelteKit with unified API across multiple platforms,
			declarative route protection, and pre-built UI components.
		</p>

		<div class="flex gap-4 justify-center pt-4">
			<a
				href="/auth"
				class="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-600 transition-colors"
			>
				Try Demo
			</a>
			<a
				href="https://github.com/jerrythomas/kavach"
				target="_blank"
				rel="noopener noreferrer"
				class="px-6 py-3 border border-surface-z3 rounded-lg font-medium hover:bg-surface-z1 transition-colors"
			>
				View on GitHub
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
			<div class="p-6 border border-surface-z3 rounded-lg">
				<h3 class="text-xl font-semibold mb-2">Platform Agnostic</h3>
				<p class="text-surface-z7">
					Switch between Supabase, Firebase, Auth0, Amplify, or Convex by swapping one adapter
				</p>
			</div>
			<div class="p-6 border border-surface-z3 rounded-lg">
				<h3 class="text-xl font-semibold mb-2">Declarative Protection</h3>
				<p class="text-surface-z7">
					Define route rules once; no scattered authentication checks
				</p>
			</div>
			<div class="p-6 border border-surface-z3 rounded-lg">
				<h3 class="text-xl font-semibold mb-2">Type Safe</h3>
				<p class="text-surface-z7">
					Full TypeScript support with centralized types and unified session management
				</p>
			</div>
		</div>
	</div>
</main>

