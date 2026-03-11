<script>
	export let data
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-2xl font-semibold">Admin Dashboard</h1>
	<p class="text-neutral-600">
		This page is only accessible to users with the <code class="bg-neutral-100 px-1 rounded">admin</code> role.
	</p>
	<p class="text-neutral-600">
		The guardian protects this route — non-admin users are redirected with a 403 status.
	</p>

	<div class="mt-4 p-4 bg-neutral-50 rounded border border-neutral-200">
		<h2 class="text-sm font-semibold text-neutral-500 uppercase mb-2">Session Info</h2>
		<dl class="grid grid-cols-2 gap-2 text-sm">
			<dt class="text-neutral-500">Email</dt>
			<dd>{data.session?.user?.email ?? 'unknown'}</dd>
			<dt class="text-neutral-500">Role</dt>
			<dd>{data.session?.user?.role ?? 'none'}</dd>
			<dt class="text-neutral-500">Adapter</dt>
			<dd>{data.adapter}</dd>
		</dl>
	</div>
</div>
