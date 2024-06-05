import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from './validators'
import { tick } from 'svelte'
import AuthProvider from '../../src/ui/AuthProvider.svelte'

expect.extend({ toHaveBeenDispatchedWith })
describe('AuthProvider.svelte', () => {
	const handlers = {
		error: vi.fn(),
		success: vi.fn()
	}
	const kavach = {
		signIn: vi.fn().mockImplementation((input) => {
			const result =
				input.email === 'john.doe@example.com'
					? { data: { token: 'token' } }
					: { error: 'Invalid email' }
			return Promise.resolve(result)
		})
	}
	beforeEach(() => {
		cleanup()
		handlers.error.mockClear()
		handlers.success.mockClear()
	})

	describe('oauth', () => {
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
	})

	describe('otp', () => {
		it('should render magic link', async () => {
			const { container, component } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props: {
					mode: 'otp',
					name: 'magic',
					label: 'Sign in with Magic Link',
					class: 'custom'
				}
			})
			component.$on('error', handlers.error)
			component.$on('success', handlers.success)

			expect(container).toMatchSnapshot()
			const form = container.querySelector('form')

			await fireEvent.input(form.querySelector('input'), {
				target: { value: 'john.doe@example.com' }
			})
			await fireEvent.submit(form)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				provider: 'magic',
				email: 'john.doe@example.com'
			})
			expect(handlers.success).toHaveBeenDispatchedWith({ token: 'token' })
			expect(handlers.error).not.toHaveBeenCalled()
		})

		it('should render magic link wth custom class', async () => {
			const { container, component } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props: {
					mode: 'otp',
					name: 'magic',
					label: 'Sign in with Magic Link'
				}
			})
			expect(container).toMatchSnapshot()
			component.$set({ class: 'custom', name: 'otp', label: 'Send me a link' })
			await tick()
			expect(container).toMatchSnapshot()
		})
		it('should handle errors', async () => {
			const { container, component } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props: {
					mode: 'otp',
					name: 'magic',
					label: 'Sign in with Magic Link'
				}
			})
			component.$on('error', handlers.error)
			component.$on('success', handlers.success)

			expect(container).toMatchSnapshot()
			const form = container.querySelector('form')

			await fireEvent.submit(form)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				provider: 'magic',
				email: null
			})
			expect(handlers.success).not.toHaveBeenCalled()
			expect(handlers.error).toHaveBeenDispatchedWith('Invalid email')
		})
	})

	describe('password', () => {
		it('should render email/password auth', async () => {
			const { container, component } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props: { mode: 'password', name: 'email', label: 'Sign in with Email' }
			})
			component.$on('error', handlers.error)
			component.$on('success', handlers.success)

			const button = container.querySelector('button')
			expect(container).toMatchSnapshot()

			await fireEvent.input(container.querySelector('input#email'), {
				target: { value: 'john.doe@example.com' }
			})
			await fireEvent.click(button)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				email: 'john.doe@example.com',
				password: ''
			})
			expect(handlers.success).toHaveBeenDispatchedWith({ token: 'token' })
			expect(handlers.error).not.toHaveBeenCalled()
		})

		it('should handle errors', async () => {
			const { container, component } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props: { mode: 'password', name: 'email', label: 'Sign in with Email' }
			})
			component.$on('error', handlers.error)
			component.$on('success', handlers.success)

			const button = container.querySelector('button')
			expect(container).toMatchSnapshot()
			await fireEvent.click(button)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				email: '',
				password: ''
			})
			expect(handlers.success).not.toHaveBeenCalled()
			expect(handlers.error).toHaveBeenCalled()
			expect(handlers.error).toHaveBeenDispatchedWith('Invalid email')
		})
	})
})
