import { vi } from 'vitest'

export function createMockResponse() {
	const Response = vi.fn().mockImplementation(function (...status) { return status })
	Response.redirect = vi.fn()
	return Response
}
