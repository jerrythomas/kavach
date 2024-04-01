<script>
	import { InputCheckbox } from '@rokkit/atoms/input'
	import { List } from '@rokkit/organisms'
	import User from '$lib/User.svelte'

	export let todos = [
		{ completed: true, task: 'a completed task' },
		{ completed: false, task: 'a pending task' }
	]
	const history = [
		{
			name: 'Jerry Thomas',
			email: 'jerry.thomas@senecaglobal.com',
			scopes: [],
			provider: 'azure'
		}
	]
	export let value

	function add() {
		todos = [...todos, { completed: false, task: value }]
		value = ''
	}

	function handleSelect(event) {
		alert(JSON.stringify(event.detail))
	}
</script>

<form class="flex flex-row w-full" on:submit={add}>
	<input type="text" name="todo" bind:value class="flex flex-grow" />
</form>

{#each todos as todo}
	<div class="flex flex-row w-full items-center gap-2 task">
		<InputCheckbox bind:value={todo.completed} />
		<!-- <Input type="checkbox" name="completed" bind:checked={todo.completed} /> -->
		<input type="text" bind:value={todo.task} class="flex flex-grow" readOnly={todo.completed} />
		<icon class="delete" />
	</div>
{/each}

<List items={history} using={{ default: User }} on:select={handleSelect} />

<style>
	.task {
		@apply border-b py-2 border-neutral-200;
	}
	.task input {
		@apply border-none bg-transparent;
	}
	.task input[readOnly] {
		@apply line-through italic;
	}
	.task input:not([readOnly]):focus {
		@apply border;
	}
</style>
