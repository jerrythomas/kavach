<script>
	export let mode
	export let error
	export let email
	export let phone
</script>

{#if error && error !== 'null'}
	<error class="flex flex-col">
		{error}
	</error>
{:else if mode === 'otp' && (email || phone)}
	<info class="flex flex-col">
		Magic link has been sent to {email ?? phone}
	</info>
{/if}
