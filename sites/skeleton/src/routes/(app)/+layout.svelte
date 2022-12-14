<script>
	import UserProfile from '$lib/UserProfile.svelte'
	import { page } from '$app/stores'

	let menu = [
		{ icon: 'home', href: '/', label: 'Home' },
		{ icon: 'todo', href: '/todo', label: 'To do' },
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
	class="grid grid-cols-3 w-full my-auto border border-skin-200 rounded-md shadow-lg max-h-screen overflow-scroll"
>
	<section
		class="flex flex-col bg-skin-zebra p-6 pt-10 gap-2 rounded-l-md border-r border-skin-200 col-span-2"
	>
		<slot />
	</section>
	<aside class="flex flex-col gap-2 px-4 py-6">
		{#if user}
			<UserProfile {...user} />
		{/if}
		<nav class="flex flex-col leading-loose gap-2px">
			{#each menu as { href, icon, label }}
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
		@apply px-4 py-2 bg-skin-100;
	}
	.active {
		@apply bg-gradient-to-r from-primary-500 to-secondary-500 text-skin-50;
	}
</style>
