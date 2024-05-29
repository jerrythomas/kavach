import { getLogWriter } from '../src/writer.js'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', async (importOriginal) => ({
	...(await importOriginal()),
	createClient: vi.fn().mockReturnValue({
		from: vi.fn().mockReturnValue({
			insert: vi.fn()
		})
	})
}))

describe('getLogWriter', () => {
	const client = { from: vi.fn().mockReturnValue({ insert: vi.fn() }) }

	it('should use supabase config', () => {
		const config = { url: 'http://localhost', anonKey: 'key' }
		const writer = getLogWriter(config)
		expect(writer).toEqual({ write: expect.any(Function) })

		writer.write({ message: 'hello' })
	})

	it('should use the provided client', () => {
		const writer = getLogWriter({ client })
		writer.write({ message: 'hello' })
		expect(client.from).toHaveBeenCalledWith('logs')
		expect(client.from().insert).toHaveBeenCalledWith({ message: 'hello' })
	})

	it('should use the provided table', () => {
		const writer = getLogWriter({ client }, { table: 'custom' })
		writer.write({ message: 'hello' })
		expect(client.from).toHaveBeenCalledWith('custom')
		expect(client.from().insert).toHaveBeenCalledWith({ message: 'hello' })
	})
})
