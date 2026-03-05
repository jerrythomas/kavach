<script lang="ts">
	import { AuthProvider } from '@kavach/ui'
</script>

<div
	class="flex flex-col bg-surface-z1 text-surface-z9 items-center justify-center min-h-[calc(100vh-4rem)] px-8"
>
	<div
		class="flex flex-col w-full max-w-md border border-surface-z3 rounded-lg shadow-lg p-8 gap-4"
	>
		<h1 class="text-2xl font-bold text-center mb-4">Demo Authentication</h1>

		<section class="flex flex-col w-full gap-2">
			<AuthProvider name="email" mode="password" label="Sign in with Email" />
		</section>

		<div class="w-full border-t border-surface-z3 my-2"></div>

		<section class="flex flex-col w-full gap-2">
			<AuthProvider name="azure" label="Continue with Azure" scopes={['email', 'profile']} />
		</section>
		<section class="flex flex-col w-full gap-2">
			<AuthProvider name="google" label="Continue with Google" scopes={['email', 'profile']} />
		</section>

		<p class="text-sm text-surface-z7 text-center mt-4">
			After signing in, you'll be redirected to the demo dashboard
		</p>
	</div>
</div>
