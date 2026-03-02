import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import EmailInput from '../src/EmailInput.svelte'

describe('EmailInput', () => {
	beforeEach(() => {
		userEvent.setup()
		cleanup()
	})

	it('should send email on click', async () => {
		const props = $state({ value: '', onclick: vi.fn() })
		const { container } = render(EmailInput, { props })

		const emailInput = container.querySelector('input[type="email"]')
		await userEvent.click(emailInput)
		await userEvent.clear(emailInput)
		await userEvent.type(emailInput, 'john.doe@example.com')
		await userEvent.tab()
		expect(emailInput.value).toBe('john.doe@example.com')

		await fireEvent.click(container.querySelector('button'))
		expect(props.onclick).toHaveBeenCalledWith({
			value: 'john.doe@example.com'
		})
	})
})
