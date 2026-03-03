import { describe, it, expect } from 'vitest'
import {
	patchViteConfig,
	patchHooksServer,
	patchLayoutServer,
	patchEnvFile
} from '../src/patchers.js'

describe('patchViteConfig', () => {
	it('should add kavach plugin to existing vite config', () => {
		const input = `import { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [sveltekit()] }`
		const output = patchViteConfig(input)
		expect(output).toContain("import { kavach } from '@kavach/cli/vite'")
		expect(output).toContain('kavach()')
		expect(output).toContain('sveltekit()')
	})

	it('should not duplicate if kavach already present', () => {
		const input = `import { kavach } from '@kavach/cli/vite'\nimport { sveltekit } from '@sveltejs/kit/vite'\nexport default { plugins: [kavach(), sveltekit()] }`
		const output = patchViteConfig(input)
		const count = (output.match(/kavach\(\)/g) || []).length
		expect(count).toBe(1)
	})
})

describe('patchHooksServer', () => {
	it('should create hooks.server.js when empty', () => {
		const output = patchHooksServer('')
		expect(output).toContain("import { kavach } from '$kavach/auth'")
		expect(output).toContain('kavach.handle')
	})

	it('should inject into existing hooks with sequence', () => {
		const input = `import { myHook } from '$lib/hooks'\nexport const handle = myHook`
		const output = patchHooksServer(input)
		expect(output).toContain("import { sequence } from '@sveltejs/kit/hooks'")
		expect(output).toContain('kavach.handle')
		expect(output).toContain('sequence(')
	})

	it('should add to existing sequence', () => {
		const input = `import { sequence } from '@sveltejs/kit/hooks'\nimport { myHook } from '$lib/hooks'\nexport const handle = sequence(myHook)`
		const output = patchHooksServer(input)
		expect(output).toContain('kavach.handle')
		expect(output).toContain('sequence(kavach.handle, myHook)')
	})
})

describe('patchLayoutServer', () => {
	it('should create layout server when empty', () => {
		const output = patchLayoutServer('')
		expect(output).toContain('export function load')
		expect(output).toContain('locals.session')
	})

	it('should add session to existing load', () => {
		const input = `export function load({ locals }) { return { title: 'App' } }`
		const output = patchLayoutServer(input)
		expect(output).toContain('session')
		expect(output).toContain('title')
	})
})

describe('patchEnvFile', () => {
	const envConfig = { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }

	it('should append missing env vars from config.env', () => {
		const input = 'EXISTING_VAR=value'
		const output = patchEnvFile(input, envConfig)
		expect(output).toContain('EXISTING_VAR=value')
		expect(output).toContain('PUBLIC_SUPABASE_URL=')
		expect(output).toContain('PUBLIC_SUPABASE_ANON_KEY=')
	})

	it('should not duplicate existing vars', () => {
		const input = 'PUBLIC_SUPABASE_URL=http://localhost'
		const output = patchEnvFile(input, envConfig)
		const count = (output.match(/PUBLIC_SUPABASE_URL/g) || []).length
		expect(count).toBe(1)
	})

	it('should handle empty env file', () => {
		const output = patchEnvFile('', envConfig)
		expect(output).toContain('PUBLIC_SUPABASE_URL=')
		expect(output).toContain('PUBLIC_SUPABASE_ANON_KEY=')
	})
})
