import { describe, expect, it, vi } from 'vitest'
import { createMockAdapter } from './mock'
import { createKavach } from '../src/kavach'

describe('Endpoint functions', () => {
	let adapter
	beforeEach(() => {
		adapter = createMockAdapter()
		global.fetch = vi.fn()
		global.Response = vi.fn().mockImplementation((...status) => status)
		global.Response.redirect = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	// @vitest-environment node
	it('should handle auth changes on browser', async () => {
		let invalidate = vi.fn()

		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			await cb('SIGNED_IN', 'foo')
		})
		const kavach = createKavach(adapter, { invalidate })

		kavach.onAuthChange()
		expect(adapter.onAuthChange).not.toHaveBeenCalled()
		expect(global.fetch).not.toHaveBeenCalled()
		expect(invalidate).not.toHaveBeenCalled()
	})
})
