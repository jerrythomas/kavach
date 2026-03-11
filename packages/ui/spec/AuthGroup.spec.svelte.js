import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import AuthGroup from '../src/AuthGroup.svelte'

describe('AuthGroup.svelte', () => {
	const handlers = {
		error: vi.fn(),
		success: vi.fn()
	}
	const kavach = {
		signIn: vi.fn().mockImplementation(() => Promise.resolve({ data: { token: 'token' } }))
	}

	beforeEach(() => {
		cleanup()
	})

	it('should render multiple providers', async () => {
		const props = $state({
			providers: [
				{
					name: 'google',
					label: 'Sign in with Google',
					onerror: handlers.error,
					onsuccess: handlers.success
				}
			]
		})
		const { container } = render(AuthGroup, {
			context: new Map([['kavach', kavach]]),
			props
		})
		// component.$on('error', handlers.error)
		// component.$on('success', handlers.success)
		const buttons = container.querySelectorAll('button')
		expect(container).toMatchSnapshot()

		await fireEvent.click(buttons[0])
		expect(kavach.signIn).toHaveBeenCalledWith({
			provider: 'google',
			scopes: []
		})
		expect(handlers.success).not.toHaveBeenCalled()
		expect(handlers.error).not.toHaveBeenCalled()
	})
})
