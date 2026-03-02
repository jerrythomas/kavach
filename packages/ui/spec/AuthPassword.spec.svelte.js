import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'
import AuthPassword from '../src/AuthPassword.svelte'

// expect.extend({ toHaveBeenDispatchedWith })
describe('AuthPassword.svelte', () => {
	const handle = vi.fn()

	beforeEach(() => {
		userEvent.setup()
		cleanup()
		handle.mockClear()
	})

	it('should render email/password auth', async () => {
		const props = $state({ onclick: handle, value: '', password: '' })
		const { container } = render(AuthPassword, { props })
		expect(container).toMatchSnapshot()

		const emailInput = container.querySelector('input[type="email"]')
		const passwordInput = container.querySelector('input#password')
		const button = container.querySelector('button')

		expect(emailInput).toBeTruthy()
		expect(passwordInput).toBeTruthy()
		expect(button).toBeTruthy()

		props.value = 'john.doe@example.com'
		props.password = 'password'
		flushSync()
		await fireEvent.click(button)
		await tick()
		expect(handle).toHaveBeenCalledWith({
			email: 'john.doe@example.com',
			password: 'password'
		})
	})
	it('should render phone/password auth', async () => {
		const props = $state({ type: 'phone', onclick: handle })
		const { container } = render(AuthPassword, { props })
		expect(container).toMatchSnapshot()

		const phoneInput = container.querySelector('input[type="tel"]')
		const passwordInput = container.querySelector('input[type="password"]')
		const button = container.querySelector('button')

		await userEvent.type(phoneInput, '+1 555-555-555')
		await userEvent.type(passwordInput, 'password')
		await fireEvent.click(button)
		await tick()
		expect(handle).toHaveBeenCalledWith({
			// phone: '+1 555-555-555',
			phone: '',
			password: ''
		})
	})
})
