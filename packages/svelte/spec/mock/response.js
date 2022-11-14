export function createMockResponse() {
	let Response = vi.fn().mockImplementation((...status) => status)
	Response.redirect = vi.fn()
	return Response
}
