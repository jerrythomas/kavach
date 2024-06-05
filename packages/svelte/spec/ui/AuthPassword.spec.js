import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { tick } from 'svelte'
import { toHaveBeenDispatchedWith } from './validators'
import AuthPassword from '../../src/ui/AuthPassword.svelte'

expect.extend({ toHaveBeenDispatchedWith })
describe('AuthPassword.svelte', () => {
	const handle = vi.fn()

	beforeEach(() => {
		// userEvent.setup()
		cleanup()
		handle.mockClear()
	})

	it('should render email/password auth', async () => {
		const { container, component } = render(AuthPassword)
		expect(container).toMatchSnapshot()

		component.$on('click', handle)
		const emailInput = container.querySelector('input[type="email"]')
		const passwordInput = container.querySelector('input#password')
		const button = container.querySelector('button')

		await userEvent.type(emailInput, 'john.doe@example.com')
		await userEvent.type(passwordInput, 'password') // password value does not change

		await fireEvent.click(button)
		await tick()
		expect(handle).toHaveBeenDispatchedWith({
			email: 'john.doe@example.com',
			password: ''
		})
	})
	it('should render phone/password auth', async () => {
		const { container, component } = render(AuthPassword, {
			props: { type: 'phone' }
		})
		expect(container).toMatchSnapshot()
		component.$on('click', handle)

		const phoneInput = container.querySelector('input[type="tel"]')
		const passwordInput = container.querySelector('input[type="password"]')
		const button = container.querySelector('button')

		await fireEvent.input(phoneInput, { target: { value: '+1 555-555-555' } })
		await fireEvent.input(passwordInput, { target: { value: 'password' } })
		await fireEvent.click(button)
		await tick()
		expect(handle).toHaveBeenDispatchedWith({
			phone: '+1 555-555-555',
			password: ''
		})
	})
})
