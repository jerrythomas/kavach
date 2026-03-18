import { parseModule, generateCode } from 'magicast'

export function patchViteConfig(content) {
	if (content.includes("from '@kavach/vite'")) return content

	const mod = parseModule(content)
	const code = generateCode(mod).code

	const importLine = "import { kavach } from '@kavach/vite'"
	const withImport = `${importLine}\n${code}`

	// Add kavach() to plugins array — insert before sveltekit()
	return withImport.replace(/plugins:\s*\[/, 'plugins: [kavach(), ')
}

export function patchHooksServer(content) {
	if (!content.trim()) {
		return `import { kavach } from '$kavach/auth'

export const handle = kavach.handle
`
	}

	const hasSequence = content.includes('sequence')
	const hasKavach = content.includes('$kavach/auth')

	if (hasKavach) return content

	let result = `import { kavach } from '$kavach/auth'\n${content}`

	if (hasSequence) {
		// Add kavach.handle as first arg to existing sequence()
		result = result.replace(/sequence\(/, 'sequence(kavach.handle, ')
	} else {
		// Add sequence import and wrap existing handle
		result = `import { sequence } from '@sveltejs/kit/hooks'\n${result}`

		// Replace `export const handle = <expr>` with sequence(kavach.handle, <expr>)
		result = result.replace(
			/export\s+const\s+handle\s*=\s*([^\n]+)/,
			'export const handle = sequence(kavach.handle, $1)'
		)
	}

	return result
}

export function patchLayoutServer(content) {
	if (!content.trim()) {
		return `export function load({ locals }) {
	return {
		session: locals.session
	}
}
`
	}

	// If already has session, return as-is
	if (content.includes('locals.session')) return content

	// Add session to existing return object
	return content.replace(/return\s*\{/, 'return {\n\t\tsession: locals.session,')
}

export function patchEnvFile(content, envConfig) {
	const lines = content ? content.split('\n') : []
	const existing = new Set(lines.map((l) => l.split('=')[0]).filter(Boolean))

	const additions = []
	for (const varName of Object.values(envConfig)) {
		if (!existing.has(varName)) {
			additions.push(`${varName}=`)
		}
	}

	if (additions.length === 0) return content

	const separator = content.trim() ? '\n' : ''
	return `${content.trimEnd() + separator + additions.join('\n')}\n`
}

const KAVACH_SETUP = `
	const kavach = $state({})
	setContext('kavach', kavach)

	onMount(async () => {
		const { createKavach } = await import('kavach')
		const { adapter, logger } = await import('$kavach/auth')
		const { invalidateAll } = await import('$app/navigation')
		const instance = createKavach(adapter, { logger, invalidateAll })
		Object.assign(kavach, instance)
		instance.onAuthChange($page.url)
	})`

const KAVACH_MINIMAL_LAYOUT = `<script>
	import { setContext, onMount } from 'svelte'
	import { page } from '$app/stores'

	let { children } = $props()
${KAVACH_SETUP}
</script>

{@render children()}
`

export function patchLayoutSvelte(content) {
	if (content.includes("setContext('kavach'")) return content

	// No <script> block — generate a complete minimal layout
	const scriptMatch = content.match(/<script(\s[^>]*)?>/)
	if (!content.trim() || !scriptMatch) {
		return KAVACH_MINIMAL_LAYOUT
	}

	const scriptTag = scriptMatch[0]
	let result = content

	// Inject missing svelte imports after the opening <script> tag
	if (!content.includes('setContext') && !content.includes('onMount')) {
		result = result.replace(
			scriptTag,
			`${scriptTag}\n\timport { setContext, onMount } from 'svelte'`
		)
	} else if (!content.includes('setContext')) {
		result = result.replace(scriptTag, `${scriptTag}\n\timport { setContext } from 'svelte'`)
	} else if (!content.includes('onMount')) {
		result = result.replace(scriptTag, `${scriptTag}\n\timport { onMount } from 'svelte'`)
	}

	// NOTE: uses original scriptTag as search string. Safe because each replace
	// only prepends content after the tag, so the literal '<script' string
	// remains at position 0 in result for subsequent replacements.
	if (!content.includes("from '$app/stores'")) {
		result = result.replace(scriptTag, `${scriptTag}\n\timport { page } from '$app/stores'`)
	}

	// Inject kavach setup before closing </script>
	result = result.replace('</script>', `${KAVACH_SETUP}\n</script>`)

	return result
}
