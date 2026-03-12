import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getActions } from '../src/actions'

describe('getActions (convex)', () => {
	const queryResult = [{ _id: 'id1', name: 'Alice' }]
	const mutationResult = { _id: 'id1', name: 'Alice' }
	const actionResult = { sent: true }

	function createClient() {
		return {
			query: vi.fn().mockResolvedValue(queryResult),
			mutation: vi.fn().mockResolvedValue(mutationResult),
			action: vi.fn().mockResolvedValue(actionResult)
		}
	}

	function createApi() {
		const listFn = { _type: 'query', _path: 'users:list' }
		const createFn = { _type: 'mutation', _path: 'users:create' }
		const upsertFn = { _type: 'mutation', _path: 'users:upsert' }
		const updateFn = { _type: 'mutation', _path: 'users:update' }
		const removeFn = { _type: 'mutation', _path: 'users:remove' }
		const sendWelcomeFn = { _type: 'action', _path: 'actions:sendWelcome' }

		return {
			users: {
				list: listFn,
				create: createFn,
				upsert: upsertFn,
				update: updateFn,
				remove: removeFn
			},
			actions: {
				sendWelcome: sendWelcomeFn
			}
		}
	}

	let client, api

	beforeEach(() => {
		client = createClient()
		api = createApi()
	})

	it('should return an object with all action methods', () => {
		const actions = getActions(client, api)
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

	it('should throw if client is not provided', () => {
		expect(() => getActions(null, api)).toThrow('getActions requires a Convex client')
	})

	it('should throw if api is not provided', () => {
		expect(() => getActions(client, null)).toThrow('getActions requires a Convex api reference')
	})

	describe('get', () => {
		it('should call api.users.list via client.query', async () => {
			const actions = getActions(client, api)
			const response = await actions.get('users')
			expect(client.query).toHaveBeenCalledWith(api.users.list, {
				filters: [],
				orders: [],
				limit: undefined,
				offset: undefined
			})
			expect(response.data).toEqual(queryResult)
			expect(response.status).toBe(200)
			expect(response.error).toBeNull()
		})

		it('should pass parsed filters and orders to query', async () => {
			const actions = getActions(client, api)
			await actions.get('users', { filter: { status: 'eq.active' }, order: 'name.asc', limit: 10 })
			expect(client.query).toHaveBeenCalledWith(api.users.list, {
				filters: [{ column: 'status', op: 'eq', value: 'active' }],
				orders: [{ column: 'name', ascending: true }],
				limit: 10,
				offset: undefined
			})
		})

		it('should throw if api.users.list is missing', async () => {
			const actions = getActions(client, {})
			await expect(actions.get('users')).rejects.toThrow('api.users.list')
		})
	})

	describe('put', () => {
		it('should call api.users.create via client.mutation', async () => {
			const actions = getActions(client, api)
			const response = await actions.put('users', { name: 'Carol' })
			expect(client.mutation).toHaveBeenCalledWith(api.users.create, { name: 'Carol' })
			expect(response.data).toEqual(mutationResult)
			expect(response.status).toBe(200)
		})

		it('should throw if api.users.create is missing', async () => {
			const actions = getActions(client, {})
			await expect(actions.put('users', { name: 'x' })).rejects.toThrow('api.users.create')
		})
	})

	describe('post', () => {
		it('should call api.users.upsert via client.mutation', async () => {
			const actions = getActions(client, api)
			const response = await actions.post('users', { _id: 'id1', name: 'Carol' })
			expect(client.mutation).toHaveBeenCalledWith(api.users.upsert, { _id: 'id1', name: 'Carol' })
			expect(response.data).toEqual(mutationResult)
			expect(response.status).toBe(200)
		})

		it('should throw if api.users.upsert is missing', async () => {
			const actions = getActions(client, {})
			await expect(actions.post('users', { _id: 'id1' })).rejects.toThrow('api.users.upsert')
		})
	})

	describe('patch', () => {
		it('should call api.users.update via client.mutation', async () => {
			const actions = getActions(client, api)
			const input = { data: { name: 'Updated' }, filter: { _id: 'eq.id1' } }
			const response = await actions.patch('users', input)
			expect(client.mutation).toHaveBeenCalledWith(api.users.update, input)
			expect(response.data).toEqual(mutationResult)
			expect(response.status).toBe(200)
		})

		it('should throw if api.users.update is missing', async () => {
			const actions = getActions(client, {})
			await expect(actions.patch('users', {})).rejects.toThrow('api.users.update')
		})
	})

	describe('delete', () => {
		it('should call api.users.remove via client.mutation', async () => {
			const actions = getActions(client, api)
			const input = { filter: { _id: 'eq.id1' } }
			const response = await actions.delete('users', input)
			expect(client.mutation).toHaveBeenCalledWith(api.users.remove, input)
			expect(response.data).toEqual(mutationResult)
			expect(response.status).toBe(200)
		})

		it('should throw if api.users.remove is missing', async () => {
			const actions = getActions(client, {})
			await expect(actions.delete('users', {})).rejects.toThrow('api.users.remove')
		})
	})

	describe('call', () => {
		it('should call a Convex action via dot-path', async () => {
			const actions = getActions(client, api)
			const response = await actions.call('actions.sendWelcome', { userId: 'u1' })
			expect(client.action).toHaveBeenCalledWith(api.actions.sendWelcome, { userId: 'u1' })
			expect(response.data).toEqual(actionResult)
			expect(response.status).toBe(200)
		})

		it('should throw if path cannot be resolved', async () => {
			const actions = getActions(client, api)
			await expect(actions.call('actions.missing', {})).rejects.toThrow('api.actions.missing')
		})

		it('should return error response when action throws', async () => {
			client.action = vi.fn().mockRejectedValue(new Error('Action failed'))
			const actions = getActions(client, api)
			const response = await actions.call('actions.sendWelcome', { userId: 'u1' })
			expect(response.status).toBe(500)
			expect(response.error).toEqual({ message: 'Action failed' })
			expect(response.data).toBeNull()
		})
	})

	describe('error handling', () => {
		it('should return error response when query throws', async () => {
			client.query = vi.fn().mockRejectedValue(new Error('Query failed'))
			const actions = getActions(client, api)
			const response = await actions.get('users')
			expect(response.status).toBe(500)
			expect(response.error).toEqual({ message: 'Query failed' })
			expect(response.data).toBeNull()
		})

		it('should return error response when mutation throws', async () => {
			client.mutation = vi.fn().mockRejectedValue(new Error('Mutation failed'))
			const actions = getActions(client, api)
			const response = await actions.put('users', { name: 'x' })
			expect(response.status).toBe(500)
			expect(response.error).toEqual({ message: 'Mutation failed' })
			expect(response.data).toBeNull()
		})
	})
})
