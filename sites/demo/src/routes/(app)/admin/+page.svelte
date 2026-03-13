<script>
	let { data } = $props()
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">Admin Panel</h1>

	<div class="bg-warning-100 border-warning-300 rounded-lg border p-4">
		<p class="text-warning-900">
			This page is only accessible to users with the
			<code class="bg-warning-200 rounded px-1">admin</code> role. Non-admin users are redirected to dashboard
			automatically.
		</p>
	</div>

	<div class="border-surface-z3 rounded-lg border p-4">
		<h2 class="text-surface-z5 mb-3 text-sm font-semibold uppercase">Session Info</h2>
		<dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
			<dt class="text-surface-z6">Email</dt>
			<dd class="font-medium">{data.session?.user?.email ?? '—'}</dd>
			<dt class="text-surface-z6">Role</dt>
			<dd>
				<span
					class="bg-success-100 text-success-800 rounded px-2 py-0.5 text-xs font-semibold uppercase"
				>
					{data.session?.user?.role ?? 'none'}
				</span>
			</dd>
			<dt class="text-surface-z6">User ID</dt>
			<dd class="text-surface-z7 font-mono text-xs">{data.session?.user?.id ?? '—'}</dd>
		</dl>
	</div>

	<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-4 text-sm">
		<p class="text-surface-z5 mb-1 text-xs font-semibold tracking-wider uppercase">Kavach rule</p>
		<code class="text-primary font-mono">{`{ path: '/admin', roles: ['admin'] }`}</code>
		<p class="text-surface-z6 mt-1 text-xs">
			Enforced server-side via sentry. Non-admin users get a 303 redirect.
		</p>
	</div>
</div>
