import { vi } from 'vitest'

export function createMockHeaders(headers) {
	return {
		location: headers?.location ?? '',
		cookie: headers?.cookie ?? '',
		get: vi
			.fn()
			.mockImplementation((key) => (key in headers ? headers[key] : null))
	}
}
