import { vi } from 'vitest'

export function createMockResponse() {
	const Response = vi.fn().mockImplementation((...status) => status)
	Response.redirect = vi.fn()
	return Response
}
