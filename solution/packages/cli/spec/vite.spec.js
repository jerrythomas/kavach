import { describe, it, expect } from 'vitest'
import { kavach } from '../src/vite.js'

describe('kavach vite plugin', () => {
	it('should return a plugin with correct name', () => {
		const plugin = kavach()
		expect(plugin.name).toBe('kavach')
	})

	it('should resolve $kavach/* virtual module ids', () => {
		const plugin = kavach()
		expect(plugin.resolveId('$kavach/auth')).toBe('\0$kavach/auth')
		expect(plugin.resolveId('$kavach/config')).toBe('\0$kavach/config')
		expect(plugin.resolveId('$kavach/routes')).toBe('\0$kavach/routes')
		expect(plugin.resolveId('$kavach/providers')).toBe('\0$kavach/providers')
	})

	it('should not resolve non-kavach modules', () => {
		const plugin = kavach()
		expect(plugin.resolveId('svelte')).toBeUndefined()
		expect(plugin.resolveId('$app/navigation')).toBeUndefined()
	})
})
