<script>
	export let data
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-xl">Welcome!</h1>
	<p class="text-neutral-500">Adapter: <strong>{data.adapter}</strong></p>
	<nav class="flex gap-4">
		<a href="/data" class="p-2 bg-primary-600 text-white rounded text-center">CRUD Demo</a>
		<a href="/public" class="p-2 bg-neutral-200 rounded text-center">Public Page</a>
	</nav>
</div>
