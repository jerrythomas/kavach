<script>
	import UserProfile from '$lib/UserProfile.svelte'
	import { page } from '$app/states'

	const menu = [
		{ icon: 'home', href: '/', label: 'Home' },
		{ icon: 'lock', href: '/protected', label: 'Protected' },
		{ icon: 'unlock', href: '/public', label: 'Public' },
		{ icon: 'logout', href: '/logout', label: 'Logout' }
	]

	export let data

	$: user = data.session?.user
	// $: avatar = user ? gravatar(user.email) : ''
	// $: userName = user ? user.name ?? deriveName(user.email) : ''
</script>

<content
	class="my-auto grid max-h-screen w-full grid-cols-3 overflow-scroll rounded-md border border-neutral-200 shadow-lg"
>
	<section
		class="bg-neutral-zebra col-span-2 flex flex-col gap-2 rounded-l-md border-r border-neutral-200 p-6 pt-10"
	>
		<slot />
	</section>
	<aside class="flex flex-col gap-2 px-4 py-6">
		{#if user}
			<UserProfile {...user} />
		{/if}
		<nav class="gap-2px flex flex-col leading-loose">
			{#each menu as { href, icon, label }, index (index)}
				<a {href} class:active={$page.url.pathname === href}>
					<icon class={icon} />
					{label}
				</a>
			{/each}
		</nav>
	</aside>
</content>

<style>
	nav a {
		@apply bg-neutral-100 px-4 py-2;
	}
	.active {
		@apply from-primary-500 to-secondary-500 bg-gradient-to-r text-neutral-50;
	}
</style>
