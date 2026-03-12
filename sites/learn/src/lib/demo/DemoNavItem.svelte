<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { hackerMode } from './hacker.svelte'

	let {
		href,
		label,
		icon,
		locked = false
	}: {
		href: string
		label: string
		icon: string
		locked?: boolean
	} = $props()

	const isActive = $derived(
		$page.url.pathname === href || $page.url.pathname.startsWith(href + '/')
	)

	function handleClick(e: MouseEvent) {
		if (locked && !hackerMode.value) {
			e.preventDefault()
			// Non-admin user in App Mode: do nothing (Kavach will redirect server-side anyway)
			return
		}
		// In Hacker Mode: navigate freely, Kavach will show the 403
	}
</script>

<a
	{href}
	onclick={handleClick}
	class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
    {isActive
		? 'bg-primary text-white'
		: locked && !hackerMode.value
			? 'text-surface-z4 cursor-not-allowed'
			: 'text-surface-z7 hover:bg-surface-z2 hover:text-surface-z9'}"
>
	<span class="{icon} h-4 w-4 shrink-0" aria-hidden="true"></span>
	<span class="flex-1">{label}</span>
	{#if locked}
		<span
			class="h-3 w-3 shrink-0 {hackerMode.value
				? 'i-app:code-visible text-warning-500'
				: 'i-app:shield text-surface-z4'}"
			title={hackerMode.value ? 'Hacker Mode: navigation enabled' : 'Admin only'}
			aria-hidden="true"
		></span>
	{/if}
</a>
