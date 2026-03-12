<script lang="ts">
	import { page } from '$app/stores'
	import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'

	let { data } = $props()
	const platformId = $derived($page.params.platform)
	const user = $derived((data as any)?.user ?? null)
	const role = $derived(user?.role ?? null)
	const base = $derived(`/demo/${platformId}`)
</script>

<div class="flex flex-col gap-6">
	<!-- Welcome card -->
	<div class="border-surface-z3 bg-surface-z1 rounded-2xl border p-6">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-surface-z9 text-2xl font-black">Welcome back</h1>
				<p class="text-surface-z6 mt-1 text-sm">{user?.email ?? 'Unknown user'}</p>
			</div>
			<span
				class="font-mono text-sm font-bold rounded-full px-3 py-1 {role === 'admin'
					? 'bg-warning-100 text-warning-700'
					: 'bg-primary/10 text-primary'}"
			>
				{role ?? 'authenticated'}
			</span>
		</div>
	</div>

	<!-- Nav tiles -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<a
			href="{base}/data"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app:list text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Space Facts</span>
			<span class="text-surface-z6 text-xs">Role-gated data — see what you can access</span>
			<span class="text-success-600 text-xs">✓ Open to all authenticated users</span>
		</a>

		<a
			href="{base}/admin"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow
				{role !== 'admin' ? 'opacity-60' : ''}"
		>
			<span class="i-app:shield text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Admin Panel</span>
			<span class="text-surface-z6 text-xs">Session info, user management, settings</span>
			{#if role === 'admin'}
				<span class="text-success-600 text-xs">✓ Admin access granted</span>
			{:else}
				<span class="text-error-500 text-xs">✗ Requires admin role</span>
			{/if}
		</a>

		<a
			href="{base}/logout"
			class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app:logout text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-surface-z8 font-semibold">Sign Out</span>
			<span class="text-surface-z6 text-xs">End the session and return to platform page</span>
		</a>
	</div>

	<!-- Sentry annotation -->
	<SentryAnnotation
		title="This page is protected by Sentry"
		body={"The rule { path: '/demo/" + platformId + "/dashboard', roles: '*' } allows any authenticated user to reach this page. Unauthenticated visitors are redirected to the platform page automatically."}
		rule="roles: *"
	/>
</div>
