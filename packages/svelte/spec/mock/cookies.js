import { vi } from 'vitest'

export function createMockCookies(cookies = {}) {
	return {
		get: vi
			.fn()
			.mockImplementation((key) => (key in cookies ? cookies[key] : null))
	}
}
