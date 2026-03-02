<script>
	import { InputCheckbox } from '@rokkit/input'
	import { List } from '@rokkit/ui'
	import User from '$lib/User.svelte'

	let todos = [
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
	let value

	function add() {
		todos = [...todos, { completed: false, task: value }]
		value = ''
	}

	function handleSelect(event) {
		alert(JSON.stringify(event.detail))
	}
</script>

<form class="flex w-full flex-row" on:submit={add}>
	<input type="text" name="todo" bind:value class="flex flex-grow" />
</form>

{#each todos as todo, index (index)}
	<div class="task flex w-full flex-row items-center gap-2">
		<InputCheckbox bind:value={todo.completed} />
		<!-- <Input type="checkbox" name="completed" bind:checked={todo.completed} /> -->
		<input type="text" bind:value={todo.task} class="flex flex-grow" readOnly={todo.completed} />
		<icon class="delete" />
	</div>
{/each}

<List items={history} using={{ default: User }} on:select={handleSelect} />

<style>
	.task {
		@apply border-b border-neutral-200 py-2;
	}
	.task input {
		@apply border-none bg-transparent;
	}
	.task input[readOnly] {
		@apply italic line-through;
	}
	.task input:not([readOnly]):focus {
		@apply border;
	}
</style>
