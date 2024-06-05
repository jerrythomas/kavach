<script>
	import { gravatar } from '@kavach/core'
	export let user = null

	$: avatar = user?.avatar_url ?? gravatar(user?.email)
</script>

{#if user}
	<div class="flex flex-col gap-1">
		<p class="text-sm">{user.full_name}</p>
		<p class="text-xs mx-auto italic font-thin">{user.role}</p>
	</div>
	<a class="cursor-pointer" href="/logout">
		<img src={avatar} alt={user.name} class="aspect-square h-9 rounded-md" />
	</a>
{/if}
