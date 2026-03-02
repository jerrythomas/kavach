<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { Icon, ProgressBar } from '@rokkit/ui'
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	let { class: className = '', version, menu = [] } = $props()

	let loading = $state(false)
	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header
	class="bg-neutral-base relative flex min-h-14 w-full items-center justify-between {className}"
>
	{#if loading}
		<ProgressBar class="z-5 absolute top-0" />
	{/if}
	<div class="flex items-center gap-2 px-4">
		<a href="/" class="flex items-center">
			<img src="/kavach.svg" alt="Kavach Logo" class="h-12" />
		</a>
		{#if !$media.small}
			<small class="font-small px-2">{version}</small>
		{/if}
	</div>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<nav class="flex gap-3 pr-3 uppercase text-neutral-900">
			{#each menu as item, index (index)}
				<a
					href="/{item.slug}"
					class="active:border-secondary-700 hover:text-secondary-700 border-b-2 leading-loose"
					>{item.title}</a
				>
			{/each}
		</nav>

		<ThemeSwitcher />
		<a
			href="https://github.com/jerrythomas/kavach"
			target="_blank"
			rel="noopener noreferrer"
			class="border-none outline-none"
		>
			<Icon
				name="i-auth:github"
				label="Kavach on Github"
				role="button"
				class="border-1 border-neutral-muted rounded"
			/></a
		>
	</settings>
</header>
