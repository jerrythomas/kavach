<script>
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { createAdapter } from '$lib/browser'
	import { chatWithUser } from '$lib/chatter'

	export let data
	export let name
	export let threshold = 0.5
	export let maxAttempts = 3

	let autoplay = false
	let chatter
	let attempts = writable([])

	onMount(() => {
		const adapter = createAdapter()
		chatter = chatWithUser(adapter, { name, threshold, maxAttempts }, data)
		attempts = chatter.attempts
		autoplay = true
		if (data.contentType === 'image') start()
	})

	function start() {
		console.log('start')
		chatter.start()
	}
</script>

<chat class="flex flex-col h-full w-full border-1 bg-red-100 border-red-200">
	<content class="flex flex-col">
		{#if data.contentType === 'image'}
			<img src={data.contentUrl} alt={data.question} height="200px" />
		{:else if data.contentType === 'audio'}
			<audio {autoplay} on:ended={start}>
				<source src="contentUrl" type="audio/mpeg" />
			</audio>
		{:else if data.contentType === 'video'}
			<video src={data.contentUrl} {autoplay} on:ended={start} height="200px" />
		{/if}
	</content>
	<attempts class="flex flex-col">
		{#each $attempts as attempt}
			<attempt
				class="flex flex-row justify-end"
				class:correct={attempt.type === 'correct'}
			>
				<p
					class="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
				>
					{attempt.transcript}
				</p>
			</attempt>
		{/each}
	</attempts>
</chat>
