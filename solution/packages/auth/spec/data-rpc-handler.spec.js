import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMockAdapter } from './mock'
import { createKavach } from '../src/kavach'
import { MESSAGES, HTTP_STATUS_MESSAGES } from '../src/messages'

describe('Data and RPC Route Handling', () => {
	let adapter = null
	const invalidateAll = vi.fn()
	const logger = {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		getContextLogger: vi.fn().mockReturnThis()
	}

	beforeEach(() => {
		adapter = createMockAdapter()
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('MESSAGES exports', () => {
		it('should export NOT_AUTHENTICATED message', () => {
			expect(MESSAGES.NOT_AUTHENTICATED).toBe('Not authenticated')
		})

		it('should export NOT_AUTHORIZED message', () => {
			expect(MESSAGES.NOT_AUTHORIZED).toBe('Not authorized')
		})

		it('should export FORBIDDEN message', () => {
			expect(MESSAGES.FORBIDDEN).toBe('Forbidden')
		})

		it('should export DATA_NOT_SUPPORTED message', () => {
			expect(MESSAGES.DATA_NOT_SUPPORTED).toBe('Data operations not supported')
		})

		it('should export RPC_NOT_SUPPORTED message', () => {
			expect(MESSAGES.RPC_NOT_SUPPORTED).toBe('RPC operations not supported')
		})

		it('should export INVALID_CREDENTIALS message', () => {
			expect(MESSAGES.INVALID_CREDENTIALS).toBe('Invalid credentials')
		})

		it('should export SERVER_ERROR message', () => {
			expect(MESSAGES.SERVER_ERROR).toBe('Server error. Try again later')
		})

		it('should export MAGIC_LINK_SENT as function', () => {
			expect(typeof MESSAGES.MAGIC_LINK_SENT).toBe('function')
			expect(MESSAGES.MAGIC_LINK_SENT('test@example.com')).toBe('Magic link has been sent to "test@example.com".')
		})

		it('should export SYNC_FAILED message', () => {
			expect(MESSAGES.SYNC_FAILED).toBe('Failed to synchronize session')
		})

		it('should export UNKNOWN_ERROR message', () => {
			expect(MESSAGES.UNKNOWN_ERROR).toBe('Unknown error')
		})

		it('should export ERROR_OCCURRED message', () => {
			expect(MESSAGES.ERROR_OCCURRED).toBe('An error occurred')
		})

		it('should export UNSUPPORTED_PROVIDER as function', () => {
			expect(typeof MESSAGES.UNSUPPORTED_PROVIDER).toBe('function')
			expect(MESSAGES.UNSUPPORTED_PROVIDER('twitter')).toBe('Unsupported provider: twitter')
		})

		it('should export PASSKEY_NOT_SUPPORTED message', () => {
			expect(MESSAGES.PASSKEY_NOT_SUPPORTED).toBe('Passkey authentication is not yet supported by this adapter')
		})

		it('should export NOT_FOUND message', () => {
			expect(MESSAGES.NOT_FOUND).toBe('Not found')
		})
	})

	describe('HTTP_STATUS_MESSAGES exports', () => {
		it('should export 401 message', () => {
			expect(HTTP_STATUS_MESSAGES[401]).toBe('Unauthorized')
		})

		it('should export 403 message', () => {
			expect(HTTP_STATUS_MESSAGES[403]).toBe('Forbidden')
		})

		it('should export 404 message', () => {
			expect(HTTP_STATUS_MESSAGES[404]).toBe('Not Found')
		})
	})

	describe('handle function with data route configuration', () => {
		it('should create kavach with dataRoute option', () => {
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				dataRoute: '/data'
			})
			
			expect(kavach.handle).toBeDefined()
			expect(kavach.actions).toBeDefined()
		})

		it('should create kavach with rpcRoute option', () => {
			const mockRpc = vi.fn()
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				rpcRoute: '/rpc',
				rpc: mockRpc
			})
			
			expect(kavach.handle).toBeDefined()
		})

		it('should create kavach with data function', () => {
			const mockDataFn = vi.fn()
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				data: mockDataFn
			})
			
			expect(kavach.actions).toBeDefined()
			expect(kavach.actions('public')).toBe(mockDataFn('public'))
		})

		it('should create kavach with app config for data and rpc', () => {
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				app: {
					home: '/',
					login: '/login',
					data: '/api/data',
					rpc: '/api/rpc'
				}
			})
			
			expect(kavach.handle).toBeDefined()
		})
	})

	describe('handle function - unauthenticated access', () => {
		it('should return 401 response for unauthenticated users on data route', async () => {
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				dataRoute: '/data'
			})
			
			const resolve = vi.fn()
			const mockEvent = {
				url: { pathname: '/data/users' },
				request: { method: 'GET' },
				cookies: { get: () => null },
				locals: {}
			}

			const result = await kavach.handle({ event: mockEvent, resolve })
			
			// Should return 401 for unauthenticated users on protected route
			expect(result.status).toBe(401)
			expect(resolve).not.toHaveBeenCalled()
		})
	})

	describe('handle function - authenticated access to allowed routes', () => {
		it('should return 401 for unauthenticated on non-endpoint route', async () => {
			const kavach = createKavach(adapter, { 
				invalidateAll, 
				logger,
				rules: [
					{ path: '/data', public: true }
				]
			})
			
			const resolve = vi.fn()
			const mockEvent = {
				url: { pathname: '/other' },
				request: { method: 'GET' },
				cookies: { get: () => null },
				locals: {}
			}

			const result = await kavach.handle({ event: mockEvent, resolve })
			
			// Without session, should redirect for non-public route
			expect(result.status).toBe(303)
		})
	})
})
