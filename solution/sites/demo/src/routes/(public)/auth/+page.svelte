<script>
	import { AuthProvider } from '@kavach/ui'
</script>

<nav class="flex flex-col flex-grow items-center p-8 gap-2">
	<section class="flex flex-col w-full gap-2 py-2">
		<AuthProvider name="email" mode="password" label="Sign in" />
	</section>
	<div class="w-full border-t border-gray-300 my-2"></div>
	<section class="flex flex-col w-full gap-2 py-2">
		<AuthProvider name="azure" label="Continue With Azure" scopes={['email', 'profile']} />
	</section>
</nav>
