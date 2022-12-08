<script>
	import Header from '$lib/Header.svelte'
</script>

<content
	class="flex flex-row w-full border border-skin-200 rounded-md shadow-lg"
>
	<article
		class="text-base prose prose-skin bg-skin-100 px-8 py-4 rounded-l-md border-r border-skin-300"
	>
		<Header />
		<p class="justify">
			This demo extends the standard svelte-kit todo app by adding
			authentication and role based access using
			<a href="https://github.com/jerrythomas/kavach">Kavach</a>.
		</p>
		<ul>
			<li>Public routes are accessible to everyone.</li>
			<li>Protected routes are accessible based on role.</li>
		</ul>

		<p>Routes in this demo</p>
		<ul>
			<li>
				User can log in using the login url. If already logged in user will be
				redirected to the default home page
			</li>
			<li>
				Logged in users can log out. If user is not logged in, he/she will be
				redirected to login page.
			</li>
			<li>
				Todo is a protected link, which is only accessible when user is logged
				in. Otherwise user will be redirected to login page
			</li>
		</ul>
	</article>
	<slot />
</content>
