<script>
	import { onMount } from 'svelte'
	import { kavach } from '$lib/auth'
	import { page } from '$app/stores'

	onMount(() => {
		kavach.handleAuthChange()
	})
</script>

<header
	class="flex flex-row leading-loose px-4 py-2 gap-4 items-center justify-between"
>
	<div class="flex">
		<b>Supabase Auth Helpers Demo</b>
	</div>
	<div class="flex flex-row gap-4">
		<a class="tab" class:active={$page.url.pathname === '/'} href="/">
			Magic Link
		</a>
		<a
			class="tab"
			class:active={$page.url.pathname === '/password'}
			href="/password">Password</a
		>
		<a class="tab" class:active={$page.url.pathname === '/oauth'} href="/oauth"
			>Social Link</a
		>
	</div>
</header>
<slot />
