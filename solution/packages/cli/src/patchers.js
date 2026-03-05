import { parseModule, generateCode } from 'magicast'

export function patchViteConfig(content) {
	if (content.includes("from '@kavach/vite'")) return content

	const mod = parseModule(content)
	const code = generateCode(mod).code

	const importLine = "import { kavach } from '@kavach/vite'"
	const withImport = `${importLine  }\n${  code}`

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

	let result = `import { kavach } from '$kavach/auth'\n${  content}`

	if (hasSequence) {
		// Add kavach.handle as first arg to existing sequence()
		result = result.replace(/sequence\(/, 'sequence(kavach.handle, ')
	} else {
		// Add sequence import and wrap existing handle
		result = `import { sequence } from '@sveltejs/kit/hooks'\n${  result}`

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
	return content.replace(
		/return\s*\{/,
		'return {\n\t\tsession: locals.session,'
	)
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
	return `${content.trimEnd() + separator + additions.join('\n')  }\n`
}
