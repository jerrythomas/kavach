<script>
	import { ROUTES, COPY } from 'showcase-kavach'

	let { data } = $props()
	const user = $derived(data?.user ?? null)
	const role = $derived(user?.role ?? null)
</script>

<div class="flex flex-col gap-6">
	<div class="border-paper-edge bg-paper-soft rounded-2xl border p-6">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-ink text-2xl font-black">Welcome back</h1>
				<p class="text-ink-mute mt-1 text-sm">{user?.email ?? 'Unknown user'}</p>
			</div>
			<span
				class="rounded-full px-3 py-1 font-mono text-sm font-bold {role === 'admin'
					? 'bg-warning-soft text-warning'
					: 'bg-primary/10 text-primary'}"
			>
				{role ?? 'authenticated'}
			</span>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<a
			href={ROUTES.data}
			class="border-paper-edge bg-paper-soft hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app-list text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-ink font-semibold">{COPY.demo.data.title}</span>
			<span class="text-ink-mute text-xs">Role-gated data</span>
			<span class="text-success text-xs">✓ Open to all users</span>
		</a>

		<a
			href="/admin"
			class="border-paper-edge bg-paper-soft hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow {role !==
			'admin'
				? 'opacity-60'
				: ''}"
		>
			<span class="i-app-shield text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-ink font-semibold">{COPY.demo.sidebar.admin}</span>
			<span class="text-ink-mute text-xs">Admin-only section</span>
			{#if role === 'admin'}
				<span class="text-success text-xs">✓ Admin access granted</span>
			{:else}
				<span class="text-danger text-xs">✗ Requires admin role</span>
			{/if}
		</a>

		<a
			href={ROUTES.logout}
			class="border-paper-edge bg-paper-soft hover:border-primary group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow"
		>
			<span class="i-app-logout text-primary h-6 w-6" aria-hidden="true"></span>
			<span class="text-ink font-semibold">{COPY.demo.sidebar.signOut}</span>
			<span class="text-ink-mute text-xs">End the session</span>
		</a>
	</div>

	<div class="border-paper-edge bg-paper-soft rounded-xl border p-4 text-sm">
		<p class="text-ink-soft mb-1 text-xs font-semibold tracking-wider uppercase">
			{COPY.demo.data.ruleLabel}
		</p>
		<code class="text-primary font-mono">{`{ path: '/dashboard', roles: '*' }`}</code>
		<p class="text-ink-mute mt-1 text-xs">
			Any authenticated user can access this page. Unauthenticated visitors are redirected to <code
				>/auth</code
			>.
		</p>
	</div>
</div>
