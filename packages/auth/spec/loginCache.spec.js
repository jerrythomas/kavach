import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import * as loginCache from '../src/loginCache.js'

const STORAGE_KEY = 'kavach:logins'

function makeEntry(overrides = {}) {
	return {
		email: 'user@example.com',
		name: 'Test User',
		avatar: 'https://example.com/avatar.png',
		provider: 'google',
		mode: 'oauth',
		hasPasskey: false,
		lastLogin: Date.now(),
		...overrides
	}
}

describe('loginCache', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	// ------- get() -------
	describe('get()', () => {
		it('should return an empty array when no entries exist', () => {
			expect(loginCache.get()).toEqual([])
		})

		it('should return entries sorted by lastLogin descending', () => {
			const older = makeEntry({ email: 'a@test.com', lastLogin: 1000 })
			const newest = makeEntry({ email: 'b@test.com', lastLogin: 3000 })
			const middle = makeEntry({ email: 'c@test.com', lastLogin: 2000 })

			localStorage.setItem(STORAGE_KEY, JSON.stringify([older, newest, middle]))

			const result = loginCache.get()
			expect(result).toHaveLength(3)
			expect(result[0].email).toBe('b@test.com')
			expect(result[1].email).toBe('c@test.com')
			expect(result[2].email).toBe('a@test.com')
		})

		it('should return an empty array when stored JSON is invalid', () => {
			localStorage.setItem(STORAGE_KEY, '{{not json}}')
			expect(loginCache.get()).toEqual([])
		})

		it('should return an empty array when stored value is not an array', () => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: 'a@b.com' }))
			expect(loginCache.get()).toEqual([])
		})
	})

	// ------- set() -------
	describe('set()', () => {
		it('should add a new entry', () => {
			const entry = makeEntry()
			loginCache.set(entry)

			const result = loginCache.get()
			expect(result).toHaveLength(1)
			expect(result[0]).toEqual(entry)
		})

		it('should upsert by email — replace existing entry', () => {
			const original = makeEntry({ name: 'Original', lastLogin: 1000 })
			loginCache.set(original)

			const updated = makeEntry({ name: 'Updated', lastLogin: 2000 })
			loginCache.set(updated)

			const result = loginCache.get()
			expect(result).toHaveLength(1)
			expect(result[0].name).toBe('Updated')
			expect(result[0].lastLogin).toBe(2000)
		})

		it('should upsert case-insensitively', () => {
			loginCache.set(makeEntry({ email: 'User@Example.COM', lastLogin: 1000 }))
			loginCache.set(makeEntry({ email: 'user@example.com', name: 'Lower', lastLogin: 2000 }))

			const result = loginCache.get()
			expect(result).toHaveLength(1)
			expect(result[0].name).toBe('Lower')
		})

		it('should store up to 5 entries', () => {
			for (let i = 1; i <= 5; i++) {
				loginCache.set(makeEntry({ email: `user${i}@test.com`, lastLogin: i * 1000 }))
			}
			expect(loginCache.get()).toHaveLength(5)
		})

		it('should evict the oldest entry when exceeding max 5', () => {
			for (let i = 1; i <= 5; i++) {
				loginCache.set(makeEntry({ email: `user${i}@test.com`, lastLogin: i * 1000 }))
			}

			// Add a 6th — user1 (lastLogin=1000) should be evicted
			loginCache.set(makeEntry({ email: 'user6@test.com', lastLogin: 6000 }))

			const result = loginCache.get()
			expect(result).toHaveLength(5)

			const emails = result.map((e) => e.email)
			expect(emails).not.toContain('user1@test.com')
			expect(emails).toContain('user6@test.com')
		})

		it('should not add entry when email is missing', () => {
			loginCache.set({ name: 'No Email' })
			expect(loginCache.get()).toEqual([])
		})

		it('should not add entry when called with null', () => {
			loginCache.set(null)
			expect(loginCache.get()).toEqual([])
		})

		it('should not add entry when called with undefined', () => {
			loginCache.set(undefined)
			expect(loginCache.get()).toEqual([])
		})
	})

	// ------- remove() -------
	describe('remove()', () => {
		it('should remove an entry by email', () => {
			loginCache.set(makeEntry({ email: 'a@test.com', lastLogin: 1000 }))
			loginCache.set(makeEntry({ email: 'b@test.com', lastLogin: 2000 }))

			loginCache.remove('a@test.com')

			const result = loginCache.get()
			expect(result).toHaveLength(1)
			expect(result[0].email).toBe('b@test.com')
		})

		it('should remove case-insensitively', () => {
			loginCache.set(makeEntry({ email: 'Test@Example.com', lastLogin: 1000 }))
			loginCache.remove('test@example.com')

			expect(loginCache.get()).toEqual([])
		})

		it('should be a no-op if the email is not found', () => {
			loginCache.set(makeEntry({ email: 'a@test.com', lastLogin: 1000 }))
			loginCache.remove('nonexistent@test.com')

			expect(loginCache.get()).toHaveLength(1)
		})

		it('should be a no-op if called with empty string', () => {
			loginCache.set(makeEntry({ email: 'a@test.com', lastLogin: 1000 }))
			loginCache.remove('')
			expect(loginCache.get()).toHaveLength(1)
		})

		it('should be a no-op if called with null/undefined', () => {
			loginCache.set(makeEntry({ email: 'a@test.com', lastLogin: 1000 }))
			loginCache.remove(null)
			loginCache.remove(undefined)
			expect(loginCache.get()).toHaveLength(1)
		})
	})

	// ------- clear() -------
	describe('clear()', () => {
		it('should remove all entries', () => {
			loginCache.set(makeEntry({ email: 'a@test.com', lastLogin: 1000 }))
			loginCache.set(makeEntry({ email: 'b@test.com', lastLogin: 2000 }))

			loginCache.clear()
			expect(loginCache.get()).toEqual([])
		})

		it('should be safe to call when no entries exist', () => {
			loginCache.clear()
			expect(loginCache.get()).toEqual([])
		})

		it('should only remove kavach:logins, not other localStorage keys', () => {
			localStorage.setItem('other-key', 'value')
			loginCache.set(makeEntry())
			loginCache.clear()

			expect(localStorage.getItem('other-key')).toBe('value')
			expect(loginCache.get()).toEqual([])
		})
	})

	// ------- server-side no-op -------
	describe('server-side safety (no localStorage)', () => {
		let originalLocalStorage

		beforeEach(() => {
			originalLocalStorage = globalThis.localStorage
			delete globalThis.localStorage
		})

		afterEach(() => {
			globalThis.localStorage = originalLocalStorage
		})

		it('get() returns empty array', () => {
			expect(loginCache.get()).toEqual([])
		})

		it('set() is a no-op', () => {
			expect(() => loginCache.set(makeEntry())).not.toThrow()
		})

		it('remove() is a no-op', () => {
			expect(() => loginCache.remove('a@test.com')).not.toThrow()
		})

		it('clear() is a no-op', () => {
			expect(() => loginCache.clear()).not.toThrow()
		})
	})
})
