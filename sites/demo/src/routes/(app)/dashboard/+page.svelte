<script>
	let { data } = $props()
	const user = $derived(data?.user ?? null)
	const role = $derived(user?.role ?? null)
</script>

<div class="flex flex-col gap-6">
	<div class="border-surface-z3 bg-surface-z1 rounded-2xl border p-6">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-surface-z9 text-2xl font-black">Welcome back</h1>
				<p class="text-surface-z6 mt-1 text-sm">{user?.email ?? 'Unknown user'}</p>
			</div>
			<span
				class="rounded-full px-3 py-1 font-mono text-sm font-bold {role === 'admin'
					? 'bg-warning-100 text-warning-700'
					: 'bg-primary/10 text-primary'}"
			>
				{role ?? 'authenticated'}
			</span>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<a
			href="/data"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app-list text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Space Facts</span>
			<span class="text-surface-z6 text-xs">Role-gated data</span>
			<span class="text-success-600 text-xs">✓ Open to all users</span>
		</a>

		<a
			href="/admin"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow {role !==
			'admin'
				? 'opacity-60'
				: ''}"
		>
			<span class="i-app-shield text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Admin Panel</span>
			<span class="text-surface-z6 text-xs">Admin-only section</span>
			{#if role === 'admin'}
				<span class="text-success-600 text-xs">✓ Admin access granted</span>
			{:else}
				<span class="text-error-500 text-xs">✗ Requires admin role</span>
			{/if}
		</a>

		<a
			href="/logout"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app-logout text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Sign Out</span>
			<span class="text-surface-z6 text-xs">End the session</span>
		</a>
	</div>

	<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
		<p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
		<code class="text-primary font-mono">{`{ path: '/dashboard', roles: '*' }`}</code>
		<p class="text-surface-z6 mt-1 text-xs">
			Any authenticated user can access this page. Unauthenticated visitors are redirected to <code
				>/auth</code
			>.
		</p>
	</div>
</div>
