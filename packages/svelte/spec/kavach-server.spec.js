import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMockAdapter } from './mock'
import { createKavach } from '../src/kavach'

describe('Endpoint functions', () => {
	let adapter
	let invalidateAll = vi.fn()
	const logger = {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn()
	}
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
	it('should not run on server', async () => {
		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			await cb('SIGNED_IN', 'foo')
		})
		const kavach = createKavach(adapter, { invalidateAll, logger })

		kavach.onAuthChange()
		expect(logger.error).toHaveBeenCalledWith(
			'onAuthChange should only be called from browser'
		)
		expect(adapter.onAuthChange).not.toHaveBeenCalled()
		expect(global.fetch).not.toHaveBeenCalled()
		expect(invalidateAll).not.toHaveBeenCalled()
	})
})
