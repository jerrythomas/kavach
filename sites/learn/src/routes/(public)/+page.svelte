<script lang="ts">
	import { Button } from '@rokkit/ui'
</script>

<main
	class="bg-surface-z1 text-surface-z9 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-8"
>
	<div class="mx-auto max-w-4xl space-y-8 text-center">
		<h1 class="text-surface-z9 flex w-full items-center justify-center gap-2 text-5xl font-bold">
			<img src="/brand/kavach.svg" alt="Kavach Logo" class="h-20 w-20" />
			Kavach
		</h1>
		<p class="text-surface-z8 text-2xl">Authentication made simple</p>

		<p class="text-surface-z7 mx-auto max-w-2xl text-lg">
			A drop-in authentication framework for SvelteKit with unified API across multiple platforms,
			declarative route protection, and pre-built UI components.
		</p>

		<div class="flex justify-center gap-4 pt-4">
			<Button href="/demo/supabase" variant="primary" size="lg" target="_blank">Try Demo</Button>
			<Button href="https://github.com/jerrythomas/kavach" style="outline" size="lg"
				>View on GitHub</Button
			>
		</div>

		<div class="grid grid-cols-1 gap-6 pt-12 md:grid-cols-3">
			<div class="border-surface-z3 rounded-lg border p-6">
				<h3 class="mb-2 text-xl font-semibold">Platform Agnostic</h3>
				<p class="text-surface-z7">
					Switch between Supabase, Firebase, Auth0, Amplify, or Convex by swapping one adapter
				</p>
			</div>
			<div class="border-surface-z3 rounded-lg border p-6">
				<h3 class="mb-2 text-xl font-semibold">Declarative Protection</h3>
				<p class="text-surface-z7">Define route rules once; no scattered authentication checks</p>
			</div>
			<div class="border-surface-z3 rounded-lg border p-6">
				<h3 class="mb-2 text-xl font-semibold">Type Safe</h3>
				<p class="text-surface-z7">
					Full TypeScript support with centralized types and unified session management
				</p>
			</div>
		</div>
	</div>
</main>
