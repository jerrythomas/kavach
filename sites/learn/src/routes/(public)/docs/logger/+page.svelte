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

	const logDataShape = `{
  level: 'info',
  running_on: 'server' | 'browser',
  logged_at: '2024-01-01T00:00:00.000Z',
  context: { package, module, method, ... },
  message: string,
  data?: object,
  error?: object
}`
	import { Code } from '@rokkit/ui'
</script>

<div class="max-w-4xl">
	<h1 class="mb-4 text-3xl font-bold">Logger</h1>

	<p class="text-surface-z7 mb-8 text-lg">
		Structured, context-scoped logging with pluggable writers.
	</p>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Installation</h2>
		<Code code={`npm install @kavach/logger`} language="bash" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Basic Setup</h2>
		<Code code={basicSetup} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Writers</h2>
		<p class="mb-4">Writers define where logs go:</p>
		<Code code={consoleWriter} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Context Scoping</h2>
		<p class="mb-4">Create child loggers with inherited context:</p>
		<Code code={contextScope} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Log Levels</h2>
		<Code code={levels} language="js" />

		<div class="mt-4 overflow-x-auto">
			<table class="w-full border-collapse text-left">
				<thead>
					<tr class="border-surface-z3 border-b">
						<th class="py-2">Level</th>
						<th class="py-2">Value</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">error</td>
						<td class="py-2">1</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">warn</td>
						<td class="py-2">2</td>
					</tr>
					<tr class="border-surface-z3 border-b">
						<td class="py-2">info</td>
						<td class="py-2">3</td>
					</tr>
					<tr class="border-surface-z3 border-b">
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
		<h2 class="mb-4 text-xl font-semibold">Log Data Shape</h2>
		<Code code={logDataShape} language="js" />
	</section>

	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Zero Logger</h2>
		<p class="text-surface-z7">
			When no writer is configured, a no-op logger is returned. This means logging adds zero
			overhead unless explicitly configured.
		</p>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-semibold">Next Steps</h2>
		<ul class="space-y-2">
			<li><a href="/docs/guardian" class="text-primary hover:underline">Guardian (Sentry)</a></li>
			<li><a href="/docs/plugins/vite" class="text-primary hover:underline">Vite Plugin</a></li>
			<li><a href="/docs/configuration" class="text-primary hover:underline">Configuration</a></li>
		</ul>
	</section>
</div>
