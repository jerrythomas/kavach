<script>
	import { getContext } from 'svelte'
	import LoginCardList from './LoginCardList.svelte'
	import AuthProvider from './AuthProvider.svelte'

	const kavach = getContext('kavach')

	/**
	 * @typedef {Object} Props
	 * @property {Array<{name: string, label: string, mode?: string, scopes?: string[]}>} providers
	 */
	/** @type {Props} */
	let { providers } = $props()

	let cachedLogins = $state(kavach.getCachedLogins() || [])

	function handleCardClick({ email, provider, mode }) {
		if (mode === 'oauth') {
			kavach.signIn({ provider, scopes: [] })
		} else if (mode === 'otp') {
			kavach.signIn({ provider: 'magic', email })
		}
		// password mode: can't auto-login, user needs the form
	}

	function handleRemove(email) {
		kavach.removeCachedLogin(email)
		cachedLogins = kavach.getCachedLogins() || []
	}
</script>

<auth-page class="flex flex-col gap-2">
	{#if cachedLogins.length > 0}
		<LoginCardList logins={cachedLogins} onclick={handleCardClick} onremove={handleRemove} />

		<details data-other-options>
			<summary>Other sign-in options</summary>
			{#each providers as data (data.name)}
				<AuthProvider {...data} />
			{/each}
		</details>
	{:else}
		{#each providers as data (data.name)}
			<AuthProvider {...data} />
		{/each}
	{/if}
</auth-page>
