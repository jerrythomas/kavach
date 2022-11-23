<script>
	import Chat from './chat.svelte'
	export let data

	let adapter
	let index = 0
	// onMount(() => {

	// })

	// function start() {
	// 	chatWithUser(
	// 		adapter,
	// 		{ name: 'vijay', threshold: 0.5, maxAttempts: 3 },
	// 		data.questions[0]
	// 	)
	// 	// adapter.start()
	// }

	// $: console.log($result)
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p> -->
<Chat data={data.questions[0]} name="vijay" />
<!-- <button on:click={speak}>speak</button>
<button on:click={start}>start</button>
<button on:click={stop}>stop</button> -->
<!-- <chat>
	{#if $result}
		<img src={$result.contentUrl} alt={$result.question} width="400" />
		<p>{$result.question}</p>
	{/if}
	{#if $attempts}
		{#each $attempts as attempt}
			<div class="Flex flex-row gap-2">
				<span>{attempt.transcript}</span>
				<span>{attempt.confidence}</span>
				<span>{attempt.matches}</span>
				<span>{attempt.type}</span>
				<span>{attempt.attempt}</span>
			</div>
		{/each}
	{/if}
</chat> -->
