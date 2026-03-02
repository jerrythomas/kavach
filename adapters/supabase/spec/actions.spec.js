import { describe, expect, it, vi } from 'vitest'
import { getActions } from '../src/actions'

describe('actions', () => {
	const result = { status: 200 }

	function createClient() {
		const query = {
			eq: vi.fn().mockReturnThis(),
			neq: vi.fn().mockReturnThis(),
			gt: vi.fn().mockReturnThis(),
			gte: vi.fn().mockReturnThis(),
			lt: vi.fn().mockReturnThis(),
			lte: vi.fn().mockReturnThis(),
			like: vi.fn().mockReturnThis(),
			ilike: vi.fn().mockReturnThis(),
			in: vi.fn().mockReturnThis(),
			is: vi.fn().mockReturnThis(),
			then: vi.fn((resolve) => resolve(result))
		}
		return {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnValue(query),
			insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			upsert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			update: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			delete: vi.fn().mockReturnValue({ match: vi.fn().mockResolvedValue(result) }),
			rpc: vi.fn().mockResolvedValue(result),
			schema: vi.fn().mockReturnThis(),
			_query: query
		}
	}

	it('should return an object with actions', () => {
		const client = createClient()
		const actions = getActions(client)
		expect(actions).toEqual({
			get: expect.any(Function),
			put: expect.any(Function),
			post: expect.any(Function),
			patch: expect.any(Function),
			delete: expect.any(Function),
			call: expect.any(Function),
			connection: client
		})
	})

	describe('get', () => {
		it('should select data without input', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity')
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('*')
		})

		it('should select specific columns', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { columns: 'a,b' })
			expect(client.select).toHaveBeenCalledWith('a,b')
		})

		it('should apply eq filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { status: 'eq.active' } })
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
		})

		it('should apply gt filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { cost: 'gt.100' } })
			expect(client._query.gt).toHaveBeenCalledWith('cost', '100')
		})

		it('should apply multiple filters', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', {
				filter: { status: 'eq.active', cost: 'gt.0' }
			})
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
			expect(client._query.gt).toHaveBeenCalledWith('cost', '0')
		})

		it('should apply in filter with array value', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { status: 'in.(a,b)' } })
			expect(client._query.in).toHaveBeenCalledWith('status', ['a', 'b'])
		})

		it('should apply is.null filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { deleted_at: 'is.null' } })
			expect(client._query.is).toHaveBeenCalledWith('deleted_at', null)
		})

		it('should apply columns and filters together', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', {
				columns: 'id,name',
				filter: { status: 'eq.active' }
			})
			expect(client.select).toHaveBeenCalledWith('id,name')
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
		})
	})

	describe('put', () => {
		it('should insert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.put('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.insert).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('post', () => {
		it('should upsert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.post('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.upsert).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('patch', () => {
		it('should update data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.patch('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.update).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('delete', () => {
		it('should delete data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.delete('entity', { filter: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
		})
	})

	describe('call', () => {
		it('should call a stored procedure', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.call('entity', { data: 'value' })
			expect(client.rpc).toHaveBeenCalledWith('entity', { data: 'value' })
		})
	})
})
