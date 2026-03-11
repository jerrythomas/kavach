import { describe, expect, it, vi } from 'vitest'
import { getActions } from '../src/actions'

describe('actions', () => {
	const result = { data: [{ id: 1 }], error: null, status: 200, count: undefined }
	const normalized = { data: [{ id: 1 }], error: null, status: 200, count: undefined }

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
			order: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			range: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			then: vi.fn((resolve) => resolve(result))
		}
		return {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnValue(query),
			insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			upsert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			update: vi.fn().mockReturnValue(query),
			delete: vi.fn().mockReturnValue(query),
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
			const response = await actions.get('entity')
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('*', undefined)
			expect(response).toEqual(normalized)
		})

		it('should select specific columns', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { columns: 'a,b' })
			expect(client.select).toHaveBeenCalledWith('a,b', undefined)
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
			expect(client.select).toHaveBeenCalledWith('id,name', undefined)
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
		})

		it('should apply order', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { order: 'created_at.desc' })
			expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
		})

		it('should apply multiple orders', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { order: 'status.asc,created_at.desc' })
			expect(client._query.order).toHaveBeenCalledTimes(2)
			expect(client._query.order).toHaveBeenCalledWith('status', { ascending: true })
			expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
		})

		it('should apply limit', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { limit: 50 })
			expect(client._query.limit).toHaveBeenCalledWith(50)
		})

		it('should apply offset via range', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { limit: 50, offset: 100 })
			expect(client._query.range).toHaveBeenCalledWith(100, 149)
		})

		it('should apply offset with default limit', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { offset: 100 })
			expect(client._query.range).toHaveBeenCalledWith(100, 1099)
		})

		it('should pass count option to select', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { count: 'exact' })
			expect(client.select).toHaveBeenCalledWith('*', { count: 'exact' })
		})

		it('should not pass count option when not specified', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity')
			expect(client.select).toHaveBeenCalledWith('*', undefined)
		})

		it('should apply all options together', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', {
				columns: 'id,name',
				filter: { status: 'eq.active' },
				order: 'created_at.desc',
				limit: 25,
				offset: 50,
				count: 'exact'
			})
			expect(client.select).toHaveBeenCalledWith('id,name', { count: 'exact' })
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
			expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
			expect(client._query.limit).toHaveBeenCalledWith(25)
			expect(client._query.range).toHaveBeenCalledWith(50, 74)
		})
	})

	describe('put', () => {
		it('should insert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			const response = await actions.put('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.insert).toHaveBeenCalledWith({ data: 'value' })
			expect(client.insert().select).toHaveBeenCalled()
			expect(response).toEqual(normalized)
		})
	})

	describe('post', () => {
		it('should upsert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			const response = await actions.post('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.upsert).toHaveBeenCalledWith({ data: 'value' })
			expect(client.upsert().select).toHaveBeenCalled()
			expect(response).toEqual(normalized)
		})
	})

	describe('patch', () => {
		it('should update data without filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			const response = await actions.patch('entity', { data: { name: 'foo' } })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.update).toHaveBeenCalledWith({ name: 'foo' })
			expect(client._query.select).toHaveBeenCalled()
			expect(response).toEqual(normalized)
		})

		it('should apply eq filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.patch('entity', {
				data: { enabled: true },
				filter: { id: 'eq.123' }
			})
			expect(client.update).toHaveBeenCalledWith({ enabled: true })
			expect(client._query.eq).toHaveBeenCalledWith('id', '123')
			expect(client._query.select).toHaveBeenCalled()
		})

		it('should apply multiple filters', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.patch('entity', {
				data: { status: 'archived' },
				filter: { org: 'eq.acme', active: 'is.false' }
			})
			expect(client.update).toHaveBeenCalledWith({ status: 'archived' })
			expect(client._query.eq).toHaveBeenCalledWith('org', 'acme')
			expect(client._query.is).toHaveBeenCalledWith('active', false)
		})
	})

	describe('delete', () => {
		it('should delete without filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			const response = await actions.delete('entity')
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.delete).toHaveBeenCalled()
			expect(response).toEqual(normalized)
		})

		it('should apply eq filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.delete('entity', { filter: { id: 'eq.123' } })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client._query.eq).toHaveBeenCalledWith('id', '123')
		})

		it('should apply multiple filters', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.delete('entity', {
				filter: { status: 'eq.deleted', age: 'gt.90' }
			})
			expect(client._query.eq).toHaveBeenCalledWith('status', 'deleted')
			expect(client._query.gt).toHaveBeenCalledWith('age', '90')
		})
	})

	describe('call', () => {
		it('should call a stored procedure', async () => {
			const client = createClient()
			const actions = getActions(client)
			const response = await actions.call('entity', { data: 'value' })
			expect(client.rpc).toHaveBeenCalledWith('entity', { data: 'value' })
			expect(response).toEqual(normalized)
		})
	})

	describe('response normalization', () => {
		it('should default missing fields to null', async () => {
			const sparseResult = { status: 200 }
			const client = createClient()
			client.rpc = vi.fn().mockResolvedValue(sparseResult)
			const actions = getActions(client)
			const response = await actions.call('fn', {})
			expect(response).toEqual({
				data: null,
				error: null,
				status: 200,
				count: undefined
			})
		})

		it('should default status to 500 when error is present and status is missing', async () => {
			const errorResult = { error: { message: 'fail' } }
			const client = createClient()
			client.rpc = vi.fn().mockResolvedValue(errorResult)
			const actions = getActions(client)
			const response = await actions.call('fn', {})
			expect(response).toEqual({
				data: null,
				error: { message: 'fail' },
				status: 500,
				count: undefined
			})
		})

		it('should default status to 200 when no error and status is missing', async () => {
			const okResult = { data: [1] }
			const client = createClient()
			client.rpc = vi.fn().mockResolvedValue(okResult)
			const actions = getActions(client)
			const response = await actions.call('fn', {})
			expect(response).toEqual({
				data: [1],
				error: null,
				status: 200,
				count: undefined
			})
		})

		it('should preserve count when present', async () => {
			const countResult = { data: [], error: null, status: 200, count: 42 }
			const client = createClient()
			client.rpc = vi.fn().mockResolvedValue(countResult)
			const actions = getActions(client)
			const response = await actions.call('fn', {})
			expect(response).toEqual({
				data: [],
				error: null,
				status: 200,
				count: 42
			})
		})
	})
})
