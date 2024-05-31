import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from './validators'
import AuthProvider from '../../src/ui/AuthProvider.svelte'

expect.extend({ toHaveBeenDispatchedWith })
describe('AuthProvider.svelte', () => {
	const handlers = {
		error: vi.fn(),
		success: vi.fn()
	}
	const kavach = {
		signIn: vi
			.fn()
			.mockImplementation(() => Promise.resolve({ data: { token: 'token' } }))
	}
	beforeEach(() => {
		cleanup()
	})

	it('should render oauth button', async () => {
		const { container, component } = render(AuthProvider, {
			context: new Map([['kavach', kavach]]),
			props: { name: 'google', label: 'Sign in with Google' }
		})
		component.$on('error', handlers.error)
		component.$on('success', handlers.success)

		const button = container.querySelector('button')
		expect(container).toMatchSnapshot()

		await fireEvent.click(button)
		expect(kavach.signIn).toHaveBeenCalledWith({
			provider: 'google',
			scopes: []
		})
		expect(handlers.success).not.toHaveBeenCalled()
		expect(handlers.error).not.toHaveBeenCalled()
	})

	it('should render oauth button with scopes', async () => {
		const { container, component } = render(AuthProvider, {
			context: new Map([['kavach', kavach]]),
			props: { name: 'azure', label: 'Sign in with Azure', scopes: ['email'] }
		})
		component.$on('error', handlers.error)
		component.$on('success', handlers.success)

		const button = container.querySelector('button')
		expect(container).toMatchSnapshot()

		await fireEvent.click(button)
		expect(kavach.signIn).toHaveBeenCalledWith({
			provider: 'azure',
			scopes: ['email']
		})
		expect(handlers.success).not.toHaveBeenCalled()
		expect(handlers.error).not.toHaveBeenCalled()
	})
	it('should render magic link', async () => {})
	it('should render email/password auth', async () => {})
})
