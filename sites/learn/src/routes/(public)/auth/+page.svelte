<script lang="ts">
	import { AuthProvider } from '@kavach/ui'
	import { goto } from '$app/navigation'

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
		<h1 class="mb-4 text-center text-2xl font-bold">Demo Authentication</h1>

		<section class="flex w-full flex-col gap-2">
			<AuthProvider name="email" mode="password" label="Sign in with Email" onsuccess={onSuccess} />
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
