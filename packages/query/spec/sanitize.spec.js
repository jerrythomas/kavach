import { describe, it, expect } from 'vitest'
import { sanitizeError } from '../src/sanitize.js'

describe('sanitizeError', () => {
	it('strips details and hint from errors', () => {
		const raw = { message: 'not found', code: 'PGRST116', details: 'Row not found', hint: null, status: 406 }
		expect(sanitizeError(raw)).toEqual({ message: 'not found', code: 'PGRST116', status: 406 })
	})

	it('strips stack traces', () => {
		const raw = { message: 'fail', code: '500', stack: 'Error: fail\n  at ...' }
		const result = sanitizeError(raw)
		expect(result).not.toHaveProperty('stack')
		expect(result).not.toHaveProperty('details')
	})

	it('handles null error', () => {
		expect(sanitizeError(null)).toEqual({ message: 'Unknown error' })
	})

	it('handles undefined error', () => {
		expect(sanitizeError(undefined)).toEqual({ message: 'Unknown error' })
	})

	it('provides default message when none present', () => {
		expect(sanitizeError({})).toEqual({ message: 'An error occurred', code: undefined, status: undefined })
	})
})
