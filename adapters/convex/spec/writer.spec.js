import { getLogWriter } from '../src/writer'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getLogWriter (convex)', () => {
	const mockMutation = vi.fn().mockResolvedValue({})
	const client = { mutation: mockMutation }
	const api = { logs: { create: 'logs:create' } }

	beforeEach(() => vi.clearAllMocks())

	it('returns a writer with a write function', () => {
		const writer = getLogWriter(client, api)
		expect(writer).toEqual({ write: expect.any(Function) })
	})

	it('calls api.logs.create by default', async () => {
		const writer = getLogWriter(client, api)
		await writer.write({ level: 'info', message: 'hello' })
		expect(client.mutation).toHaveBeenCalledWith('logs:create', {
			level: 'info',
			message: 'hello'
		})
	})

	it('uses a custom entity name when provided', async () => {
		const customApi = { audit: { create: 'audit:create' } }
		const writer = getLogWriter(client, customApi, { entity: 'audit' })
		await writer.write({ message: 'test' })
		expect(client.mutation).toHaveBeenCalledWith('audit:create', { message: 'test' })
	})

	it('swallows errors silently — log failures must not crash the app', async () => {
		client.mutation.mockRejectedValueOnce(new Error('Convex error'))
		const writer = getLogWriter(client, api)
		await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
	})

	it('swallows missing entity errors silently', async () => {
		const writer = getLogWriter(client, {}, { entity: 'missing' })
		await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
	})
})
