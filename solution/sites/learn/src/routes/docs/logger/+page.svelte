<script>
	const basicSetup = `import { getLogger } from '@kavach/logger'

const logger = getLogger(consoleWriter, { level: 'info' })`

	const consoleWriter = `const consoleWriter = {
  async write(logData) {
    console.log(
      logData.level,
      logData.message,
      logData.context,
      logData.data
    )
  }
}`

	const contextScope = `const logger = getLogger(writer, { level: 'info' })

const authLogger = logger.getContextLogger({
  package: '@kavach/auth',
  module: 'kavach'
})

const signInLogger = authLogger.getContextLogger({
  method: 'signIn'
})

signInLogger.info('User signed in', { userId: '123' })
// Output includes: { package, module, method, userId }`

	const levels = `const logger = getLogger(writer, { level: 'error' })

logger.error('Error occurred')  // ✓ Logged
logger.warn('Warning')           // ✓ Logged
logger.info('Info')             // ✗ Not logged (filtered)
logger.debug('Debug')            // ✗ Not logged
logger.trace('Trace')            // ✗ Not logged`
</script>

<div class="max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Logger</h1>
	
	<p class="text-lg text-surface-z7 mb-8">
		Structured, context-scoped logging with pluggable writers.
	</p>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Installation</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>npm install @kavach/logger</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Basic Setup</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{basicSetup}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Writers</h2>
		<p class="mb-4">Writers define where logs go:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{consoleWriter}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Context Scoping</h2>
		<p class="mb-4">Create child loggers with inherited context:</p>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{contextScope}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Log Levels</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{levels}</code></pre>
		
		<div class="mt-4 overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-surface-z3">
						<th class="py-2">Level</th>
						<th class="py-2">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b border-surface-z3">
						<td class="py-2">error</td>
						<td class="py-2">1</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">warn</td>
						<td class="py-2">2</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">info</td>
						<td class="py-2">3</td>
					</tr>
					<tr class="border-b border-surface-z3">
						<td class="py-2">debug</td>
						<td class="py-2">4</td>
					</tr>
					<tr>
						<td class="py-2">trace</td>
						<td class="py-2">5</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Log Data Shape</h2>
		<pre class="bg-surface-z1 p-4 rounded-lg overflow-x-auto"><code>{`{
  level: 'info',
  running_on: 'server' | 'browser',
  logged_at: '2024-01-01T00:00:00.000Z',
  context: { package, module, method, ... },
  message: string,
  data?: object,
  error?: object
}`}</code></pre>
	</section>

	<section class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Zero Logger</h2>
		<p class="text-surface-z7">
			When no writer is configured, a no-op logger is returned. This means logging adds zero overhead unless explicitly configured.
		</p>
	</section>

	<section>
		<h2 class="text-xl font-semibold mb-4">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/guardian" class="text-primary hover:underline">Guardian (Sentry)</a></li>
			<li><a href="/docs/plugins/vite" class="text-primary hover:underline">Vite Plugin</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
		</ul>
	</section>
</div>
