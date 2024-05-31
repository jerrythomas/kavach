import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import AuthError from '../../src/ui/AuthError.svelte'

describe('AuthError.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render with changes', async () => {
		const { container, component } = render(AuthError, {
			props: { message: 'An error occurred' }
		})
		expect(container).toMatchSnapshot()

		component.$$set({ message: 'Something else', name: 'AuthApi' })
		await tick()
		expect(container).toMatchSnapshot()

		component.$$set({ message: 'Another error', status: '400' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render error with name', () => {
		const { container } = render(AuthError, {
			props: { message: 'An error', name: 'AuthApi' }
		})
		expect(container).toMatchSnapshot()
	})

	it('should render error with status', () => {
		const { container } = render(AuthError, {
			props: { message: 'An error', status: '400' }
		})
		expect(container).toMatchSnapshot()
	})

	it('should render error with status & name', () => {
		const { container } = render(AuthError, {
			props: { message: 'An error', status: '400', name: 'AuthApi' }
		})
		expect(container).toMatchSnapshot()
	})
})
