<script lang="ts">
	// import type { PageData } from './$types';
	// import Layout from '../../Layout.svelte'

	/** @type {import (./$types).PageData} */
	export let data
	$: ({ testTable, user } = data)
</script>

<!-- <Layout> -->
<div class="block w-1/2">
	<p>Protected content for {user.email}</p>
	<p>server-side fetched data with RLS:</p>
	<pre class="bg-skin-100 p-4 rounded-sm">{JSON.stringify(testTable, null, 2)}
	</pre>
</div>
<div class="block w-1/2">
	<p>user:</p>
	<pre class="bg-skin-100 p-4 rounded-sm">{JSON.stringify(user, null, 2)}
	</pre>
</div>
<!-- </Layout> -->
