<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { ProgressBar } from '@rokkit/atoms'
	import UserIcon from './UserIcon.svelte'
	import DarkModeToggle from './DarkModeToggle.svelte'

	let className = ''
	export { className as class }

	export let title
	export let user
	export let menu = []

	let loading = false

	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header
	class="flex min-h-14 w-full bg-neutral-base items-center justify-between relative border-b border-neutral-inset {className}"
>
	{#if loading}
		<ProgressBar class="absolute top-0 z-5" />
	{/if}
	<div class="flex items-center gap-2 px-4">
		<a href="/" class="flex items-center">
			<img src="favicon.png" alt="logo" class="aspect-square h-8" />
		</a>
		<p>{title}</p>
	</div>
	<top-menu class="flex flex-grow items-center justify-center">
		<nav class="flex gap-3 pr-3 uppercase text-neutral-900">
			{#each menu as item}
				<a
					href="/{item.slug}"
					class="border-b-2 leading-loose active:border-secondary-700 hover:text-secondary-700"
					>{item.title}</a
				>
			{/each}
		</nav>
	</top-menu>
	<settings class="flex items-center justify-end gap-4 pr-4">
		<DarkModeToggle />
		<UserIcon {user} />
	</settings>
</header>
