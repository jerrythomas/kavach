import { describe, expect, it, vi } from 'vitest'
import { getActions } from '../src/actions'

describe('actions', () => {
	const result = vi.fn().mockResolvedValue({ status: 200 })
	const client = {
		from: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnValue({ match: result }),
		insert: vi.fn().mockReturnValue({ select: result }),
		upsert: vi.fn().mockReturnValue({ select: result }),
		update: vi.fn().mockReturnValue({ select: result }),
		delete: vi.fn().mockReturnValue({ match: result }),
		rpc: result
	}

	it('should return an object with actions', () => {
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
			const actions = getActions(client)
			await actions.get('entity')
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('*')
			expect(client.select().match).toHaveBeenCalledWith({})
		})

		it('should select data applying filter', async () => {
			const actions = getActions(client)
			await actions.get('entity', { filter: { id: 'value' } })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('*')
			expect(client.select().match).toHaveBeenCalledWith({ id: 'value' })
		})

		it('should select specific columns', async () => {
			const actions = getActions(client)
			await actions.get('entity', { columns: 'column' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('column')
			expect(client.select().match).toHaveBeenCalledWith({})
		})

		it('should select specific columns and apply filter', async () => {
			const actions = getActions(client)
			await actions.get('entity', { columns: 'a,b', filter: { id: 'value' } })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('a,b')
			expect(client.select().match).toHaveBeenCalledWith({ id: 'value' })
		})
	})

	describe('put', () => {
		it('should insert data', async () => {
			const actions = getActions(client)
			await actions.put('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.insert).toHaveBeenCalledWith({ data: 'value' })
			expect(client.insert().select).toHaveBeenCalled()
		})
	})

	describe('post', () => {
		it('should upsert data', async () => {
			const actions = getActions(client)
			await actions.post('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.upsert).toHaveBeenCalledWith({ data: 'value' })
			expect(client.upsert().select).toHaveBeenCalled()
		})
	})

	describe('patch', () => {
		it('should update data', async () => {
			const actions = getActions(client)
			await actions.patch('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.update).toHaveBeenCalledWith({ data: 'value' })
			expect(client.update().select).toHaveBeenCalled()
		})
	})

	describe('delete', () => {
		it('should delete data', async () => {
			const actions = getActions(client)
			await actions.delete('entity', { filter: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.delete).toHaveBeenCalledWith()
			expect(client.delete().match).toHaveBeenCalledWith({ filter: 'value' })
		})
	})

	describe('call', () => {
		it('should call a stored procedure', async () => {
			const actions = getActions(client)
			await actions.call('entity', { data: 'value' })
			expect(client.rpc).toHaveBeenCalledWith('entity', { data: 'value' })
		})
	})
})
