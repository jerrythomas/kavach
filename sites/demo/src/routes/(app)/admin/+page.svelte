<script>
	import { COPY } from 'showcase-kavach'

	let { data } = $props()
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">{COPY.demo.sidebar.admin}</h1>

	<div class="border-warning bg-warning-soft rounded-lg border p-4">
		<p class="text-warning">
			This page is only accessible to users with the
			<code class="bg-warning/15 rounded px-1">admin</code> role. Non-admin users are redirected to dashboard
			automatically.
		</p>
	</div>

	<div class="border-paper-edge rounded-lg border p-4">
		<h2 class="text-ink-soft mb-3 text-sm font-semibold uppercase">Session Info</h2>
		<dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
			<dt class="text-ink-mute">Email</dt>
			<dd class="font-medium">{data.session?.user?.email ?? '—'}</dd>
			<dt class="text-ink-mute">Role</dt>
			<dd>
				<span
					class="bg-success-soft text-success rounded px-2 py-0.5 text-xs font-semibold uppercase"
				>
					{data.session?.user?.role ?? 'none'}
				</span>
			</dd>
			<dt class="text-ink-mute">User ID</dt>
			<dd class="text-ink-mute font-mono text-xs">{data.session?.user?.id ?? '—'}</dd>
		</dl>
	</div>

	<div class="border-paper-edge bg-paper-soft rounded-xl border p-4 text-sm">
		<p class="text-ink-soft mb-1 text-xs font-semibold tracking-wider uppercase">
			{COPY.demo.data.ruleLabel}
		</p>
		<code class="text-primary font-mono">{`{ path: '/admin', roles: ['admin'] }`}</code>
		<p class="text-ink-mute mt-1 text-xs">
			Enforced server-side via sentry. Non-admin users get a 303 redirect.
		</p>
	</div>
</div>
