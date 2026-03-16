<script>
	import { Code } from '@rokkit/ui'

	const initCmd = `# run from your SvelteKit project root
npx kavach init
# or with bun
bunx kavach init`

	const initGenerates = `kavach.config.js                        adapter, providers, rules, env var names
vite.config.js                          kavach() plugin injected before sveltekit()
src/hooks.server.js                     kavach.handle registered
src/routes/+layout.server.js            session: locals.session passed to pages
src/routes/(public)/auth/+page.svelte   auth page with configured providers
.env                                    env var keys added (values left empty)`

	const doctorCmds = `npx kavach doctor        # check only — no changes made
npx kavach doctor --fix  # check and auto-repair fixable issues`

	const doctorExample = `  ✓ kavach.config.js — valid
  ✗ vite.config.js — kavach() plugin missing
      Run kavach doctor --fix
  ✗ hooks.server.ts — must import from '$kavach/auth' and export kavach.handle
      Run kavach doctor --fix
  ✓ +layout.server.ts — valid
  ✗ .env — empty values: PUBLIC_SUPABASE_URL
      set PUBLIC_SUPABASE_URL=<your-value> in .env
  ✓ dependencies — all installed

  3 issues found. Run kavach doctor --fix to repair what can be fixed automatically.`

	const doctorFixExample = `  ✓ kavach.config.js — valid
  ✔ vite.config.js — patched
  ✔ hooks.server.ts — patched
  ✓ +layout.server.ts — valid
  ✗ .env — empty values: PUBLIC_SUPABASE_URL
      set PUBLIC_SUPABASE_URL=<your-value> in .env
  ✓ dependencies — all installed

  1 issue requires manual action — see above.`

	const addCmds = `npx kavach add auth-page   # auth page with configured providers
npx kavach add routes      # data and RPC route handlers`

	const antiPatterns = `// ✗ No default export — will throw at runtime
import kavach from 'kavach'

// ✗ Don't call createKavach in hooks.server — $kavach/auth already has a configured instance
import { createKavach } from 'kavach'
export const handle = createKavach(adapter).handle

// ✗ Do not alias the kavach package in vite.config
resolve: { alias: { kavach: '/path/to/src/index.ts' } }

// ✗ Not needed — $kavach/auth handles SSR bundling
ssr: { noExternal: ['kavach'] }

// ✓ Always use the virtual module in hooks.server
import { kavach } from '$kavach/auth'
export const handle = kavach.handle`

	const doctorChecks = [
		['1', 'kavach.config.js exists with adapter, env, rules', 'No — run kavach init'],
		['2', 'vite.config.js has kavach() from @kavach/vite before sveltekit()', 'Yes'],
		['3', 'hooks.server imports $kavach/auth and exports kavach.handle', 'Yes'],
		['4', '+layout.server passes session: locals.session', 'Yes'],
		['5', 'All env keys from config exist in .env', 'Yes — adds empty keys'],
		['6', '.env values are non-empty', 'No — prints set KEY=<value> instruction'],
		['7', 'Adapter + kavach packages in package.json', 'Yes — installs missing']
	]
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">CLI</h1>
	<p class="text-surface-z7 mb-6 text-lg">
		Always use the CLI to set up and maintain kavach. Never hand-write <code>kavach.config.js</code
		>, vite patches, or hooks files.
	</p>

	<div class="border-primary bg-primary/5 mb-8 rounded-lg border-l-4 p-4 text-sm">
		<strong>For AI agents:</strong> Never hand-craft kavach integration files. Use
		<code>npx kavach init</code> for first-time setup and
		<code>npx kavach doctor --fix</code> to repair existing setups. Hand-written files are the most common
		source of broken integrations.
	</div>

	<h2 class="mt-8 mb-3 text-xl font-semibold">kavach init</h2>
	<p class="text-surface-z7 mb-3">
		Scaffolds a complete kavach setup. Run once per project from the SvelteKit project root.
	</p>
	<Code code={initCmd} language="bash" />

	<h3 class="mt-5 mb-2 font-semibold">Interactive prompts</h3>
	<ol class="text-surface-z7 mb-4 list-inside list-decimal space-y-1 text-sm">
		<li>Choose adapter — supabase | firebase | auth0 | amplify | convex</li>
		<li>Choose providers — email/password, magic link, Google, GitHub, etc.</li>
		<li>Configure data route (optional, adapter-dependent)</li>
		<li>Configure RPC route (optional, adapter-dependent)</li>
		<li>Configure logging (optional, adapter-dependent)</li>
		<li>Set auth route path (default: <code>(public)/auth</code>)</li>
		<li>Set logout route (default: <code>/logout</code>)</li>
		<li>Enable cached logins</li>
		<li>Define route protection rules</li>
	</ol>

	<h3 class="mt-5 mb-2 font-semibold">Files generated / patched</h3>
	<Code code={initGenerates} language="text" />

	<h2 class="mt-10 mb-3 text-xl font-semibold">kavach doctor</h2>
	<p class="text-surface-z7 mb-3">
		Validates an existing kavach integration and optionally auto-repairs fixable issues. Use this
		after <code>kavach init</code>, after manual changes, or when diagnosing a broken setup.
	</p>
	<Code code={doctorCmds} language="bash" />

	<h3 class="mt-5 mb-2 font-semibold">Checks performed</h3>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="py-2 pr-3">#</th>
					<th class="py-2 pr-4">Check</th>
					<th class="py-2">Auto-fixable</th>
				</tr>
			</thead>
			<tbody>
				{#each doctorChecks as [n, check, fix]}
					<tr class="border-surface-z3 border-b">
						<td class="text-surface-z5 py-2 pr-3">{n}</td>
						<td class="py-2 pr-4 text-sm">{check}</td>
						<td class="text-surface-z6 py-2 text-sm">{fix}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h3 class="mt-5 mb-2 font-semibold">Example output</h3>
	<Code code={doctorExample} language="text" />
	<p class="text-surface-z7 mt-3 mb-2 text-sm">After running with <code>--fix</code>:</p>
	<Code code={doctorFixExample} language="text" />

	<h2 class="mt-10 mb-3 text-xl font-semibold">kavach add</h2>
	<p class="text-surface-z7 mb-3">Add components to an existing setup.</p>
	<Code code={addCmds} language="bash" />
	<div class="mt-4 overflow-x-auto">
		<table class="w-full border-collapse text-left text-sm">
			<thead>
				<tr class="border-surface-z3 border-b">
					<th class="py-2 pr-6">Command</th>
					<th class="py-2">Generates</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-surface-z3 border-b">
					<td class="py-2 pr-6"><code>kavach add auth-page</code></td>
					<td class="text-surface-z6 py-2"
						>Auth page with all configured providers using <code>&lt;AuthPage /&gt;</code></td
					>
				</tr>
				<tr>
					<td class="py-2 pr-6"><code>kavach add routes</code></td>
					<td class="text-surface-z6 py-2">Data and RPC route handlers under configured paths</td>
				</tr>
			</tbody>
		</table>
	</div>

	<h2 class="mt-10 mb-3 text-xl font-semibold">Anti-patterns</h2>
	<p class="text-surface-z7 mb-3">
		These patterns look reasonable but cause broken integrations. The CLI avoids them automatically.
	</p>
	<Code code={antiPatterns} language="js" />

	<h2 class="mt-10 mb-3 text-xl font-semibold">Verifying your setup</h2>
	<p class="text-surface-z7 mb-3">
		After <code>kavach init</code> or any manual changes:
	</p>
	<Code code={`npx kavach doctor`} language="bash" />
	<p class="text-surface-z7 mt-3 text-sm">
		All 7 checks should show ✓. If any show ✗, run <code>kavach doctor --fix</code> and follow the printed
		instructions for any remaining manual items.
	</p>
</div>
