<script>
	import { kavach } from '$lib'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	export let data

	function signin() {
		kavach.signIn(
			'otp',
			{ email: 'jerry.thomas@senecaglobal.com' },
			{ redirect: 'http://localhost:5173' }
		)
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<button on:click={signin}>Sign in</button>
