<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let email = ''
	export let avatar = ''
	export let provider = 'magic'
	export let name = ''
	export let small = true

	function remove() {
		dispatch('remove', { email, provider })
	}

	function handleKeydown(event) {
		if (['Escape', 'Delete', 'Backspace'].includes(event.key)) {
			remove()
		} else if (['Space', 'Enter'].includes(event.key)) {
			handleClick()
		}
	}

	function handleClick() {
		dispatch('click', { email, provider })
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<user-card
	class:flex-col={small}
	class="flex rounded-lg shadow relative items-center justify-center"
	tabindex="0"
	on:keydown={handleKeydown}
	on:click={handleClick}
>
	<img src={avatar} alt="Profile of {name}" class="profile" />
	<div class="flex flex-col">
		<p>{name}</p>
		<span class="flex flex-row"
			><p>Logged in using</p>
			<icon class={provider} /></span
		>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<icon class="cross absolute top-2 right-2" on:click={remove} />
</user-card>
