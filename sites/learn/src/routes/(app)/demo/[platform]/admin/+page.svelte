<script lang="ts">
	import type { PageData } from './$types'
	import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'

	let { data }: { data: PageData } = $props()
</script>

<div class="flex flex-col gap-4 p-8">
	<h1 class="text-2xl font-bold">Admin Panel</h1>

	<SentryAnnotation
		title="Admin Panel — requires admin role"
		body="Sentry enforces { path: '/demo/[platform]/admin', roles: ['admin'] }. Non-admin users are redirected to dashboard in App Mode. In Hacker Mode, the redirect is bypassed and Sentry's enforcement is shown here."
		rule="roles: ['admin']"
	/>

	<div class="bg-warning-100 border-warning-300 rounded-lg border p-4">
		<p class="text-warning-900">
			This page is only accessible to users with the <code class="bg-warning-200 rounded px-1"
				>admin</code
			> role. Non-admin users are redirected away automatically.
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

	<div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="border-surface-z3 rounded-lg border p-6">
			<h3 class="mb-2 text-lg font-semibold">User Management</h3>
			<p class="text-surface-z7">Manage users and their roles</p>
		</div>
		<div class="border-surface-z3 rounded-lg border p-6">
			<h3 class="mb-2 text-lg font-semibold">System Settings</h3>
			<p class="text-surface-z7">Configure system-wide settings</p>
		</div>
	</div>
</div>
