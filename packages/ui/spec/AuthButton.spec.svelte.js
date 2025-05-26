import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import AuthButton from '../src/AuthButton.svelte'

describe('AuthButton.svelte', () => {
	const handleClick = vi.fn()

	beforeEach(() => {
		cleanup()
	})

	it('should render using provider', async () => {
		const props = $state({
			provider: 'google',
			label: 'Sign in with Google',
			onclick: handleClick
		})
		const { container } = render(AuthButton, { props })
		const button = container.querySelector('button')

		expect(container).toMatchSnapshot()
		await fireEvent.click(button)
		expect(handleClick).toHaveBeenCalledWith({
			provider: 'google',
			scopes: []
		})
	})
})
