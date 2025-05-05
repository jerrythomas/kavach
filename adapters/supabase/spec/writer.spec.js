import { getLogWriter } from '../src/writer.js'
import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

vi.mock('@supabase/supabase-js', async (importOriginal) => {
	const mod = await importOriginal()
	const from = vi.fn().mockReturnValue({ insert: vi.fn() })
	return {
		...mod,
		createClient: vi.fn().mockReturnValue({
			from,
			schema: vi.fn().mockReturnValue({ from })
		})
	}
})

const mockClientFrom = vi.fn().mockReturnValue({ insert: vi.fn() })
const mockClient = {
	from: mockClientFrom,
	schema: vi.fn().mockReturnValue({ from: mockClientFrom })
}

describe('getLogWriter', () => {
	const client = mockClient

	it('should use supabase config', () => {
		const config = { url: 'http://localhost', anonKey: 'key' }
		const client = createClient(config)
		const writer = getLogWriter(config)
		expect(writer).toEqual({ write: expect.any(Function) })

		writer.write({ message: 'hello' })
		expect(client.schema).not.toHaveBeenCalled()
		expect(client.from).toHaveBeenCalledWith('logs')
	})

	it('should use the provided table with schema', () => {
		const writer = getLogWriter({ client }, { table: 'audit.custom' })
		writer.write({ message: 'hello' })
		expect(client.schema).toHaveBeenCalledWith('audit')
		expect(client.from).toHaveBeenCalledWith('custom')
		expect(client.from().insert).toHaveBeenCalledWith({ message: 'hello' })
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
