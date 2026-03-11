import { describe, expect, it, vi, afterEach } from 'vitest'
import {
	toDataURL,
	getUserPhotoFromMicrosoft,
	asBoolean,
	gravatar,
	deriveName
} from '../src/avatar.js'

describe('Avatar functions', () => {
	describe('toDataURL', () => {
		it('should convert buffer to base64 data URL with default content type', () => {
			const buffer = Buffer.from([137, 80, 78, 71]) // Fake JPEG bytes
			const result = toDataURL(buffer)
			expect(result).toMatch(/^data:image\/jpeg;base64,/)
			expect(result).toMatch(/data:image\/jpeg;base64,/)
		})

		it('should convert buffer to base64 data URL with custom content type', () => {
			const buffer = Buffer.from('fake image data')
			const result = toDataURL(buffer, 'image/png')
			expect(result).toMatch(/^data:image\/png;base64,/)
		})
	})

	describe('getUserPhotoFromMicrosoft', () => {
		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('should fetch photo from Microsoft Graph API', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				statusText: 'OK',
				body: 'mock-stream'
			})

			const result = await getUserPhotoFromMicrosoft('test@example.com', 'token123', mockFetch)

			expect(result.ok).toBe(true)
			expect(result.status).toBe(200)
			expect(result.statusText).toBe('OK')
			expect(result.photo).toBe('mock-stream')

			expect(mockFetch).toHaveBeenCalledWith(
				'https://graph.microsoft.com/v1.0/users/test@example.com/photo/$value',
				{
					method: 'get',
					headers: { Authorization: 'Bearer token123' }
				}
			)
		})

		it('should handle failed response', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found',
				body: null
			})

			const result = await getUserPhotoFromMicrosoft('test@example.com', 'token123', mockFetch)

			expect(result.ok).toBe(false)
			expect(result.status).toBe(404)
			expect(result.statusText).toBe('Not Found')
			expect(result.photo).toBe(null)
		})
	})

	describe('asBoolean', () => {
		it('should return false for null', () => {
			expect(asBoolean(null)).toBe(false)
		})

		it('should return false for undefined', () => {
			expect(asBoolean(undefined)).toBe(false)
		})

		it('should return true for "1"', () => {
			expect(asBoolean('1')).toBe(true)
		})

		it('should return true for "yes"', () => {
			expect(asBoolean('yes')).toBe(true)
		})

		it('should return true for "true"', () => {
			expect(asBoolean('true')).toBe(true)
		})

		it('should return false for empty string', () => {
			expect(asBoolean('')).toBe(false)
		})

		it('should return false for "false"', () => {
			expect(asBoolean('false')).toBe(false)
		})

		it('should handle case insensitive values', () => {
			expect(asBoolean('YES')).toBe(true)
			expect(asBoolean('TRUE')).toBe(true)
		})
	})

	describe('gravatar', () => {
		it('should return gravatar URL with default params', () => {
			const result = gravatar('test@example.com')
			expect(result).toMatch(/^\/\/www\.gravatar\.com\/avatar\/[a-f0-9]{32}\?/)
			expect(result).toContain('d=identicon')
			expect(result).toContain('r=G')
			expect(result).toContain('s=256')
		})

		it('should return gravatar URL with custom size', () => {
			const result = gravatar('test@example.com', 128)
			expect(result).toContain('s=128')
		})

		it('should return gravatar URL with custom default image', () => {
			const result = gravatar('test@example.com', 256, 'retro')
			expect(result).toContain('d=retro')
		})

		it('should return gravatar URL with custom rating', () => {
			const result = gravatar('test@example.com', 256, 'identicon', 'PG')
			expect(result).toContain('r=PG')
		})

		it('should handle null email', () => {
			const result = gravatar(null)
			expect(result).toMatch(/gravatar\.com\/avatar\/[a-f0-9]{32}/)
		})

		it('should handle undefined email', () => {
			const result = gravatar(undefined)
			expect(result).toMatch(/gravatar\.com\/avatar\/[a-f0-9]{32}/)
		})

		it('should trim and lowercase email', () => {
			const result1 = gravatar('  Test@Example.com  ')
			const result2 = gravatar('test@example.com')
			expect(result1).toEqual(result2)
		})
	})

	describe('deriveName', () => {
		it('should derive name from email', () => {
			const result = deriveName('john.doe@example.com')
			expect(result.full_name).toBe('John Doe')
			expect(result.first).toBe('John')
			expect(result.last).toBe('Doe')
		})

		it('should handle single part email', () => {
			const result = deriveName('john@example.com')
			expect(result.full_name).toBe('John')
			expect(result.first).toBe('John')
			expect(result.last).toBe('')
		})

		it('should handle null email', () => {
			const result = deriveName(null)
			expect(result.full_name).toBe('')
			expect(result.first).toBe('')
			expect(result.last).toBe('')
		})

		it('should handle undefined email', () => {
			const result = deriveName(undefined)
			expect(result.full_name).toBe('')
			expect(result.first).toBe('')
			expect(result.last).toBe('')
		})

		it('should handle empty email', () => {
			const result = deriveName('')
			expect(result.full_name).toBe('')
			expect(result.first).toBe('')
			expect(result.last).toBe('')
		})

		it('should handle multiple dots in email', () => {
			const result = deriveName('john.doe.smith@example.com')
			expect(result.full_name).toBe('John Doe Smith')
			expect(result.first).toBe('John')
			expect(result.last).toBe('Doe Smith')
		})
	})
})
