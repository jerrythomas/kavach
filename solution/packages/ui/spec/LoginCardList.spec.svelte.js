import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import LoginCardList from '../src/LoginCardList.svelte'

describe('LoginCardList.svelte', () => {
	const handleClick = vi.fn()
	const handleRemove = vi.fn()

	const logins = [
		{
			email: 'alice@example.com',
			name: 'Alice',
			avatar: 'https://example.com/alice.jpg',
			provider: 'google',
			mode: 'oauth',
			hasPasskey: false,
			lastLogin: '2026-01-01'
		},
		{
			email: 'bob@example.com',
			name: 'Bob',
			avatar: 'https://example.com/bob.jpg',
			provider: 'github',
			mode: 'oauth',
			hasPasskey: true,
			lastLogin: '2026-02-01'
		}
	]

	beforeEach(() => {
		cleanup()
		handleClick.mockClear()
		handleRemove.mockClear()
	})

	it('renders nothing when logins is empty', () => {
		const props = $state({ logins: [], onclick: handleClick, onremove: handleRemove })
		const { container } = render(LoginCardList, { props })

		const cards = container.querySelectorAll('[data-login-card]')
		expect(cards).toHaveLength(0)
	})

	it('renders a card for each login entry', () => {
		const props = $state({ logins, onclick: handleClick, onremove: handleRemove })
		const { container } = render(LoginCardList, { props })

		const cards = container.querySelectorAll('[data-login-card]')
		expect(cards).toHaveLength(2)

		expect(cards[0].textContent).toContain('Alice')
		expect(cards[1].textContent).toContain('Bob')
	})

	it('passes onclick through to cards', async () => {
		const props = $state({ logins, onclick: handleClick, onremove: handleRemove })
		const { container } = render(LoginCardList, { props })

		const cards = container.querySelectorAll('[data-login-card]')
		await fireEvent.click(cards[0])

		expect(handleClick).toHaveBeenCalledWith({
			email: 'alice@example.com',
			provider: 'google',
			mode: 'oauth'
		})
	})

	it('passes onremove through to cards', async () => {
		const props = $state({ logins, onclick: handleClick, onremove: handleRemove })
		const { container } = render(LoginCardList, { props })

		const removeButtons = container.querySelectorAll('[data-remove]')
		await fireEvent.click(removeButtons[1])

		expect(handleRemove).toHaveBeenCalledWith('bob@example.com')
		expect(handleClick).not.toHaveBeenCalled()
	})
})
