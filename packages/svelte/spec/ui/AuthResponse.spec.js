import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import AuthResponse from '../../src/ui/AuthResponse.svelte'

describe('AuthResponse.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render response with changes', async () => {
		const { container, component } = render(AuthResponse)
		expect(container).toMatchSnapshot()
		component.$$set({ message: 'Successfully logged in' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render response with error', () => {
		const { container } = render(AuthResponse, {
			props: { message: 'An error occurred', error: true }
		})
		expect(container).toMatchSnapshot()
	})
})
