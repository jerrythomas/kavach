<script>
	import { Code } from '@rokkit/ui'
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Kavach Documentation</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Kavach is a drop-in authentication framework for SvelteKit with unified API across multiple
		platforms, declarative route protection, and pre-built UI components.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Quick Links</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/quick-start" class="text-primary hover:underline">Quick Start Guide</a>
			</li>
			<li>
				<a href="/docs/configuration" class="text-primary hover:underline">Configuration Options</a>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline">Adapter Setup</a>
			</li>
			<li><a href="/docs/cli" class="text-primary hover:underline">CLI Commands</a></li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Features</h2>
		<ul class="grid grid-cols-2 gap-4">
			<li class="border-surface-z3 rounded-lg border p-4">
				<h3 class="mb-2 font-semibold">Platform Agnostic</h3>
				<p class="text-surface-z7 text-sm">
					Switch between Supabase, Firebase, Auth0, Amplify, or Convex by swapping one adapter
				</p>
			</li>
			<li class="border-surface-z3 rounded-lg border p-4">
				<h3 class="mb-2 font-semibold">Declarative Protection</h3>
				<p class="text-surface-z7 text-sm">
					Define route rules once; no scattered authentication checks
				</p>
			</li>
			<li class="border-surface-z3 rounded-lg border p-4">
				<h3 class="mb-2 font-semibold">Type Safe</h3>
				<p class="text-surface-z7 text-sm">
					Full TypeScript support with centralized types and unified session management
				</p>
			</li>
			<li class="border-surface-z3 rounded-lg border p-4">
				<h3 class="mb-2 font-semibold">Pre-built Components</h3>
				<p class="text-surface-z7 text-sm">
					Ready-to-use UI components for login, registration, and auth flows
				</p>
			</li>
		</ul>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install kavach @kavach/guardian @kavach/ui`} language="bash" />
	</section>
</div>
