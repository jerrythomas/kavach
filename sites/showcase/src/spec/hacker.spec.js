import { describe, it, expect, beforeEach } from 'vitest'
import { hackerMode } from '../lib/state/hacker.svelte'

describe('hackerMode', () => {
	beforeEach(() => {
		hackerMode.set(false)
	})

	it('defaults to off', () => {
		expect(hackerMode.value).toBe(false)
	})

	it('toggles on and off', () => {
		hackerMode.toggle()
		expect(hackerMode.value).toBe(true)
		hackerMode.toggle()
		expect(hackerMode.value).toBe(false)
	})

	it('can be set explicitly', () => {
		hackerMode.set(true)
		expect(hackerMode.value).toBe(true)
		hackerMode.set(false)
		expect(hackerMode.value).toBe(false)
	})
})
