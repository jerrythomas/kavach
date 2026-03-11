import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import AuthProvider from '../src/AuthProvider.svelte'

// expect.extend({ toHaveBeenCalledWith })
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
			const props = $state({
				name: 'google',
				label: 'Sign in with Google',
				onerror: handlers.error,
				onsuccess: handlers.success
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

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
			const props = $state({
				name: 'azure',
				label: 'Sign in with Azure',
				scopes: ['email'],
				onsuccess: handlers.success,
				onerror: handlers.error
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

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
			const props = $state({
				mode: 'otp',
				name: 'magic',
				label: 'Sign in with Magic Link',
				class: 'custom',
				value: '',
				onsuccess: handlers.success,
				onerror: handlers.error
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

			expect(container).toMatchSnapshot()
			const form = container.querySelector('form')
			expect(form.querySelector('input')).toBeTruthy()

			props.value = 'john.doe@example.com'
			flushSync()
			await fireEvent.submit(form)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				provider: 'magic',
				email: 'john.doe@example.com'
			})
			expect(handlers.success).toHaveBeenCalledWith({ token: 'token' })
			expect(handlers.error).not.toHaveBeenCalled()
		})

		it('should render magic link wth custom class', async () => {
			const props = $state({
				mode: 'otp',
				name: 'magic',
				label: 'Sign in with Magic Link'
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})
			expect(container).toMatchSnapshot()
			props.class = 'custom'
			props.name = 'otp'
			props.label = 'Send me a link'
			await tick()
			expect(container).toMatchSnapshot()
		})
		it('should handle errors', async () => {
			const props = $state({
				mode: 'otp',
				name: 'magic',
				label: 'Sign in with Magic Link',
				onsuccess: handlers.success,
				onerror: handlers.error
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

			expect(container).toMatchSnapshot()
			const form = container.querySelector('form')

			await fireEvent.submit(form)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				provider: 'magic',
				email: ''
			})
			expect(handlers.success).not.toHaveBeenCalled()
			expect(handlers.error).toHaveBeenCalledWith('Invalid email')
		})
	})

	describe('password', () => {
		it('should render email/password auth', async () => {
			const props = $state({
				mode: 'password',
				name: 'email',
				label: 'Sign in with Email',
				value: '',
				password: '',
				onsuccess: handlers.success,
				onerror: handlers.error
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

			const button = container.querySelector('button')
			expect(container).toMatchSnapshot()

			props.value = 'john.doe@example.com'
			flushSync()
			await fireEvent.click(button)
			await tick()
			expect(kavach.signIn).toHaveBeenCalledWith({
				email: 'john.doe@example.com',
				password: ''
			})
			expect(handlers.success).toHaveBeenCalledWith({ token: 'token' })
			expect(handlers.error).not.toHaveBeenCalled()
		})

		it('should handle errors', async () => {
			const props = $state({
				mode: 'password',
				name: 'email',
				label: 'Sign in with Email',
				onsuccess: handlers.success,
				onerror: handlers.error
			})
			const { container } = render(AuthProvider, {
				context: new Map([['kavach', kavach]]),
				props
			})

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
			expect(handlers.error).toHaveBeenCalledWith('Invalid email')
		})
	})
})
