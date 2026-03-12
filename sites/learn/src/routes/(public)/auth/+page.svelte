<script lang="ts">
	import { AuthProvider } from '@kavach/ui'
	import { goto } from '$app/navigation'
	import { getContext, onMount } from 'svelte'

	interface CachedLogin {
		email: string
		name?: string
		avatar?: string
		provider?: string
		mode?: string
	}

	const kavach = getContext<any>('kavach')

	let cachedLogins = $state<CachedLogin[]>([])
	let prefillEmail = $state('')

	onMount(() => {
		const logins = kavach?.getCachedLogins?.() ?? []
		cachedLogins = logins
	})

	function pickCachedLogin(login: CachedLogin) {
		prefillEmail = login.email
	}

	function onSuccess() {
		goto('/demo/supabase')
	}
</script>

<div
	class="bg-surface-z1 text-surface-z9 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-8"
>
	<div
		class="border-surface-z3 flex w-full max-w-md flex-col gap-4 rounded-lg border p-8 shadow-lg"
	>
		<h1 class="mb-2 text-center text-2xl font-bold">Demo Authentication</h1>

		{#if cachedLogins.length > 0}
			<div class="flex flex-col gap-2">
				<p class="text-surface-z6 text-xs font-semibold uppercase">Recent accounts</p>
				<div class="flex flex-wrap gap-2">
					{#each cachedLogins as login (login.email)}
						<button
							onclick={() => pickCachedLogin(login)}
							class="border-surface-z3 hover:border-primary bg-surface-z0 flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors"
						>
							{#if login.avatar}
								<img
									src={login.avatar}
									alt={login.name ?? login.email}
									class="h-7 w-7 rounded-full object-cover"
								/>
							{:else}
								<div
									class="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
								>
									{(login.name ?? login.email)[0].toUpperCase()}
								</div>
							{/if}
							<div class="flex flex-col">
								<span class="text-xs font-medium">{login.name ?? login.email}</span>
								{#if login.provider}
									<span class="text-surface-z6 text-xs">{login.provider}</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
				<div class="border-surface-z3 mt-1 border-t"></div>
			</div>
		{/if}

		<section class="flex w-full flex-col gap-2">
			<AuthProvider
				name="email"
				mode="password"
				label="Sign in with Email"
				bind:value={prefillEmail}
				onsuccess={onSuccess}
			/>
		</section>

		<div class="border-surface-z3 my-2 w-full border-t"></div>

		<section class="flex w-full flex-col gap-2">
			<AuthProvider name="magic" mode="otp" label="Email for Magic Link" />
		</section>

		<div class="border-surface-z3 my-2 w-full border-t"></div>

		<section class="flex w-full flex-col gap-2">
			<AuthProvider name="google" label="Continue with Google" scopes={['email', 'profile']} />
		</section>

		<p class="text-surface-z7 mt-4 text-center text-sm">
			After signing in, you'll be redirected to the demo dashboard
		</p>
	</div>
</div>
