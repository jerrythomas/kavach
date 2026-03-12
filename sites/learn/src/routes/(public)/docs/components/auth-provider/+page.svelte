<script>
	const usage = `<script>
  import { AuthProvider } from '@kavach/ui'
<\/script>

<AuthProvider>
  <slot />
</AuthProvider>`

	const withConfig = `<script>
  import { AuthProvider } from '@kavach/ui'
<\/script>

<AuthProvider
  providers={[
    { name: 'google', label: 'Google' },
    { name: 'github', label: 'GitHub' }
  ]}
  cachedLogins={true}
>
  <slot />
</AuthProvider>`

	const propsTable = `| Prop | Type | Default | Description |
|------|------|---------|-------------|
| providers | Provider[] | [] | Auth providers to display |
| cachedLogins | boolean | false | Enable cached login cards |
| onAuthChange | function | - | Callback on auth state change |`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">AuthProvider</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Context provider that makes auth state available to child components.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Usage</h2>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{usage}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">With Configuration</h2>
		<pre class="bg-surface-z1 overflow-x-auto rounded-lg p-4"><code>{withConfig}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Props</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Prop</th>
						<th class="py-2">Type</th>
						<th class="py-2">Default</th>
						<th class="py-2">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">providers</td>
						<td class="py-2">Provider[]</td>
						<td class="py-2">[]</td>
						<td class="py-2">Auth providers to display</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">cachedLogins</td>
						<td class="py-2">boolean</td>
						<td class="py-2">false</td>
						<td class="py-2">Enable cached login cards</td>
					</tr>
					<tr>
						<td class="py-2">onAuthChange</td>
						<td class="py-2">function</td>
						<td class="py-2">-</td>
						<td class="py-2">Callback on auth state change</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/components/auth-button" class="text-primary hover:underline">AuthButton</a>
			</li>
			<li>
				<a href="/docs/components/auth-page" class="text-primary hover:underline">AuthPage</a>
			</li>
			<li><a href="/docs/quick-start" class="text-primary hover:underline">Quick Start</a></li>
		</ul>
	</section>
</div>
