import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from './validators'
import AuthButton from '../../src/ui/AuthButton.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('AuthButton.svelte', () => {
	const handleClick = vi.fn()

	beforeEach(() => {
		cleanup()
	})

	it('should render using provider', async () => {
		const { container, component } = render(AuthButton, {
			props: { provider: 'google', label: 'Sign in with Google' }
		})
		const button = container.querySelector('button')

		component.$on('click', handleClick)
		expect(container).toMatchSnapshot()

		await fireEvent.click(button)
		expect(handleClick).toHaveBeenDispatchedWith({
			provider: 'google',
			scopes: []
		})
	})

	// it('should render using label', async () => {
	// 	const { container, component } = render(AuthButton, {
	// 		props: { provider: 'google', label: 'Sign in with Google' }
	// 	})
	// 	const button = container.querySelector('button')

	// 	component.$on('click', handleClick)
	// 	expect(container).toMatchSnapshot()

	// 	await fireEvent.click(button)
	// 	expect(handleClick).toHaveBeenDispatchedWith({
	// 		provider: 'google',
	// 		scopes: []
	// 	})
	// })

	it('should include scopes', async () => {
		const { container, component } = render(AuthButton, {
			props: {
				provider: 'azure',
				label: 'Sign in with Azure',
				scopes: ['email']
			}
		})
		const button = container.querySelector('button')

		component.$on('click', handleClick)
		expect(container).toMatchSnapshot()

		await fireEvent.click(button)
		expect(handleClick).toHaveBeenDispatchedWith({
			provider: 'azure',
			scopes: ['email']
		})
	})
})
