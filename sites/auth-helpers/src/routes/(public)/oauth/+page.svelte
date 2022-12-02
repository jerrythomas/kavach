<script>
	// import { supabaseClient } from '$lib/db'
	import { kavach } from '$lib/auth'
	import { page } from '$app/stores'

	const supabaseClient = kavach.client
	let loadedData = []
	async function loadData() {
		const { data } = await supabaseClient.from('test').select('*').single()
		loadedData = data
	}

	$: if ($page.data.session) {
		loadData()
	}
</script>

<div class="flex flex-col gap-4 w-1/3 mx-auto mt-6">
	{#if !$page.data.session}
		<button
			on:click={() => {
				supabaseClient.auth.signInWithOAuth({
					provider: 'github',
					options: { scopes: 'public_repo user:email' }
				})
			}}
		>
			GitHub with scopes
		</button>
		<button
			on:click={() => {
				supabaseClient.auth.signInWithOAuth({
					provider: 'google',
					options: { scopes: 'https://www.googleapis.com/auth/userinfo.email' }
				})
			}}
		>
			Google
		</button>
		<button
			on:click={() => {
				supabaseClient.auth.signInWithOAuth({
					provider: 'azure',
					options: {
						// properties: [{ prompt: 'consent', domain_hint: 'organizations' }]
					}
				})
			}}
		>
			Microsoft
		</button>
	{:else}
		<p>
			[<a href="/profile">withPageAuth</a>] | [<a href="/protected-page"
				>supabaseServerClient</a
			>] | [<a href="/github-provider-token">GitHub Token</a>] |
			<button
				on:click={() =>
					supabaseClient.auth.updateUser({ data: { test5: 'updated' } })}
			>
				Update
			</button>
		</p>

		<p>user:</p>
		<pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
		<p>client-side data fetching with RLS</p>
		<pre>{JSON.stringify(loadedData, null, 2)}</pre>
	{/if}
</div>
