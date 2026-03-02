import { vi } from 'vitest'

export function createMockSession(data) {
	return {
		get: vi
			.fn()
			.mockImplementation((key) =>
				key in data.cookies ? data.cookies[key] : null
			)
	}
}
