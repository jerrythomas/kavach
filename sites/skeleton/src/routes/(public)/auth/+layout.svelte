<content
	class="flex flex-row border border-neutral-200 rounded-md shadow-lg max-w-250 mx-auto mt-10"
>
	<article
		class="text-base prose prose-neutral bg-neutral-100 px-8 py-4 rounded-l-md border-r border-neutral-300"
	>
		<h1 class="flex items-center">
			<img src="/kavach.svg" alt="Kavach Logo" class="w-20 h-20 cover" />Kavach Demo
		</h1>
		<!-- <Header>Kavach Demo</Header> -->
		<p class="justify">
			This is showcases authentication and role based access using
			<a href="https://github.com/jerrythomas/kavach">Kavach</a>. Kavach supports public and
			protected routes.
		</p>
		<ul>
			<li>Public routes are accessible to everyone.</li>
			<li>
				Protected routes are only accessible to logged in users with a specifc role. These routes
				can be configured to be different for each role.
			</li>
		</ul>

		<p>Routes in this demo</p>
		<ul>
			<li>
				User can log in using the login url. If already logged in user will be redirected to the
				default home page
			</li>
			<li>
				Logged in users can log out. If user is not logged in, he/she will be redirected to login
				page.
			</li>
			<li>
				Todo is a protected link, which is only accessible when user is logged in. Otherwise user
				will be redirected to login page
			</li>
		</ul>
	</article>
	<slot />
</content>
