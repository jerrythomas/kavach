<script>
	import { Code } from '@rokkit/ui'

	const initCmd = `npx kavach init`
	const verifyCmd = `npx kavach doctor`
	const devCmd = `npm run dev`

	const envExample = `# .env — fill in values from your backend project dashboard
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key`

	const manualInstall = `npm install kavach @kavach/vite @kavach/ui
npm install @kavach/adapter-supabase  # replace with your adapter`

	const manualVite = `// vite.config.js — kavach() must come before sveltekit()
import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [kavach(), sveltekit()]
})`

	const manualConfig = `// kavach.config.js
export default {
  adapter: 'supabase',
  providers: [
    { name: 'google', label: 'Continue with Google' },
    { name: 'magic', mode: 'otp', label: 'Magic Link' }
  ],
  rules: [
    { path: '/auth', public: true },
    { path: '/', public: true },
    { path: '/dashboard', protected: true }
  ],
  env: {
    url: 'PUBLIC_SUPABASE_URL',
    anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
  }
}`

	const manualHooks = `// src/hooks.server.js
import { kavach } from '$kavach/auth'
export const handle = kavach.handle`

	const manualLayout = `// src/routes/+layout.server.js
export function load({ locals }) {
  return { session: locals.session }
}`
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Quick Start</h1>
	<p class="text-surface-z7 mb-8 text-lg">Get kavach running in a SvelteKit project in minutes.</p>

	<section class="mb-8">
		<h2 class="mb-3 text-xl font-semibold">1. Run kavach init</h2>
		<p class="text-surface-z7 mb-3">
			From your SvelteKit project root. The wizard prompts for your adapter, providers, and route
			rules, then generates and patches all required files.
		</p>
		<Code code={initCmd} language="bash" />
		<p class="text-surface-z7 mt-3 text-sm">
			Do not create <code>kavach.config.js</code> or modify <code>vite.config.js</code> /
			<code>hooks.server.js</code> manually — the CLI handles all of this correctly.
		</p>
	</section>

	<section class="mb-8">
		<h2 class="mb-3 text-xl font-semibold">2. Fill in environment variables</h2>
		<p class="text-surface-z7 mb-3">
			<code>kavach init</code> adds the required variable names to <code>.env</code> with empty values.
			Fill them in from your backend dashboard.
		</p>
		<Code code={envExample} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-3 text-xl font-semibold">3. Verify the setup</h2>
		<Code code={verifyCmd} language="bash" />
		<p class="text-surface-z7 mt-3 text-sm">
			All 7 checks should show ✓. If any show ✗, run <code>kavach doctor --fix</code> and follow the printed
			instructions.
		</p>
	</section>

	<section class="mb-10">
		<h2 class="mb-3 text-xl font-semibold">4. Start your dev server</h2>
		<Code code={devCmd} language="bash" />
		<p class="text-surface-z7 mt-3 text-sm">
			Navigate to your auth route (default <code>/auth</code>) to see the login page.
		</p>
	</section>

	<details class="border-surface-z3 rounded-lg border p-4">
		<summary class="cursor-pointer font-semibold">Advanced: manual setup (without CLI)</summary>
		<div class="mt-4 space-y-4 text-sm">
			<p class="text-surface-z7">
				Only use this if the CLI cannot run in your environment. Manual setup is error-prone — run
				<code>kavach doctor</code> to verify afterwards.
			</p>
			<div>
				<p class="mb-2 font-medium">1. Install packages</p>
				<Code code={manualInstall} language="bash" />
			</div>
			<div>
				<p class="mb-2 font-medium">2. Create kavach.config.js</p>
				<Code code={manualConfig} language="js" />
			</div>
			<div>
				<p class="mb-2 font-medium">3. Patch vite.config.js</p>
				<Code code={manualVite} language="js" />
			</div>
			<div>
				<p class="mb-2 font-medium">4. Add hooks.server.js</p>
				<Code code={manualHooks} language="js" />
			</div>
			<div>
				<p class="mb-2 font-medium">5. Add layout.server.js</p>
				<Code code={manualLayout} language="js" />
			</div>
		</div>
	</details>

	<section class="mt-8">
		<h2 class="mb-3 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li>
				<a href="/docs/cli" class="text-primary hover:underline"
					>CLI reference — init, doctor, add</a
				>
			</li>
			<li>
				<a href="/docs/core-concepts" class="text-primary hover:underline"
					>Core concepts — auth, authorization, session</a
				>
			</li>
			<li>
				<a href="/docs/adapters/supabase" class="text-primary hover:underline">Adapter setup</a>
			</li>
		</ul>
	</section>
</div>
