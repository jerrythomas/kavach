import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import LoginCard from '../src/LoginCard.svelte'

describe('LoginCard.svelte', () => {
	const handleClick = vi.fn()
	const handleRemove = vi.fn()

	const defaultProps = {
		email: 'jane@example.com',
		name: 'Jane Doe',
		avatar: 'https://example.com/avatar.jpg',
		provider: 'google',
		mode: 'oauth',
		hasPasskey: false,
		onclick: handleClick,
		onremove: handleRemove
	}

	beforeEach(() => {
		cleanup()
		handleClick.mockClear()
		handleRemove.mockClear()
	})

	it('renders card with name, avatar image, and provider badge', () => {
		const props = $state({ ...defaultProps })
		const { container } = render(LoginCard, { props })

		const card = container.querySelector('[data-login-card]')
		expect(card).toBeTruthy()

		const img = card.querySelector('img')
		expect(img).toBeTruthy()
		expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg')

		expect(card.textContent).toContain('Jane Doe')

		const badge = card.querySelector('[data-provider="google"]')
		expect(badge).toBeTruthy()
	})

	it('fires onclick with { email, provider, mode } when card is clicked', async () => {
		const props = $state({ ...defaultProps })
		const { container } = render(LoginCard, { props })

		const card = container.querySelector('[data-login-card]')
		await fireEvent.click(card)

		expect(handleClick).toHaveBeenCalledWith({
			email: 'jane@example.com',
			provider: 'google',
			mode: 'oauth'
		})
	})

	it('fires onremove with email when remove button is clicked and onclick does not fire', async () => {
		const props = $state({ ...defaultProps })
		const { container } = render(LoginCard, { props })

		const removeBtn = container.querySelector('[data-remove]')
		expect(removeBtn).toBeTruthy()

		await fireEvent.click(removeBtn)

		expect(handleRemove).toHaveBeenCalledWith('jane@example.com')
		expect(handleClick).not.toHaveBeenCalled()
	})

	it('shows passkey icon when hasPasskey is true', () => {
		const props = $state({ ...defaultProps, hasPasskey: true })
		const { container } = render(LoginCard, { props })

		const passkey = container.querySelector('[data-passkey]')
		expect(passkey).toBeTruthy()
	})

	it('does not show passkey icon when hasPasskey is false', () => {
		const props = $state({ ...defaultProps, hasPasskey: false })
		const { container } = render(LoginCard, { props })

		const passkey = container.querySelector('[data-passkey]')
		expect(passkey).toBeNull()
	})
})
