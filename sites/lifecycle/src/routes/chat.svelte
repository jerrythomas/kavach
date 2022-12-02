<script>
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { createAdapter } from './browser'
	import { chatWithUser } from './chatter'

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

	$: visibleAttempts = $attempts.filter(
		(attempt) => attempt.confidence >= threshold
	)
</script>

<chat class="flex flex-col h-full w-full border-1 bg-teal-50">
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
	<div class="flex flex-col gap-5 py-2">
		<span class="flex flex-row justify-start">
			<p
				class="ml-2 py-3 px-4 bg-teal-400 rounded-br-3xl rounded-tl-3xl rounded-tr-xl text-white"
			>
				{data.question}
			</p>
		</span>

		<attempts class="flex flex-col gap-5">
			{#each visibleAttempts as attempt}
				<attempt class="flex flex-row justify-end">
					<p
						class="mr-2 py-3 px-4 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
						class:error={attempt.type === 'none'}
						class:correct={attempt.type !== 'none'}
					>
						{attempt.transcript}
					</p>
				</attempt>
			{/each}
		</attempts>
	</div>
</chat>
