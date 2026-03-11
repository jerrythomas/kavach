import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import AuthPage from '../src/AuthPage.svelte'

describe('AuthPage.svelte', () => {
	const providers = [
		{ name: 'google', label: 'Sign in with Google' },
		{ mode: 'otp', name: 'magic', label: 'Magic link' }
	]

	const cachedLogins = [
		{
			email: 'alice@example.com',
			name: 'Alice',
			avatar: 'https://example.com/alice.jpg',
			provider: 'google',
			mode: 'oauth',
			hasPasskey: false
		}
	]

	let kavach

	beforeEach(() => {
		cleanup()
		kavach = {
			signIn: vi.fn().mockResolvedValue({ data: { token: 'token' } }),
			getCachedLogins: vi.fn().mockReturnValue([]),
			removeCachedLogin: vi.fn()
		}
	})

	it('renders providers directly when no cached logins', () => {
		kavach.getCachedLogins.mockReturnValue([])

		const props = $state({ providers })
		const { container } = render(AuthPage, {
			context: new Map([['kavach', kavach]]),
			props
		})

		// Should NOT have details/other-options section
		const details = container.querySelector('[data-other-options]')
		expect(details).toBeNull()

		// Should render provider buttons/forms directly
		const buttons = container.querySelectorAll('button')
		expect(buttons.length).toBeGreaterThan(0)
	})

	it('renders cached login cards when logins exist', () => {
		kavach.getCachedLogins.mockReturnValue(cachedLogins)

		const props = $state({ providers })
		const { container } = render(AuthPage, {
			context: new Map([['kavach', kavach]]),
			props
		})

		const cards = container.querySelectorAll('[data-login-card]')
		expect(cards).toHaveLength(1)
		expect(cards[0].textContent).toContain('Alice')
	})

	it('shows data-other-options details section when cached logins exist', () => {
		kavach.getCachedLogins.mockReturnValue(cachedLogins)

		const props = $state({ providers })
		const { container } = render(AuthPage, {
			context: new Map([['kavach', kavach]]),
			props
		})

		const details = container.querySelector('[data-other-options]')
		expect(details).not.toBeNull()
		expect(details.tagName.toLowerCase()).toBe('details')
	})

	it('re-authenticates when cached card is clicked (oauth)', async () => {
		kavach.getCachedLogins.mockReturnValue(cachedLogins)

		const props = $state({ providers })
		const { container } = render(AuthPage, {
			context: new Map([['kavach', kavach]]),
			props
		})

		const card = container.querySelector('[data-login-card]')
		await fireEvent.click(card)

		expect(kavach.signIn).toHaveBeenCalledWith({
			provider: 'google',
			scopes: []
		})
	})

	it('removes cached login when remove button is clicked', async () => {
		kavach.getCachedLogins.mockReturnValue(cachedLogins)

		const props = $state({ providers })
		const { container } = render(AuthPage, {
			context: new Map([['kavach', kavach]]),
			props
		})

		const removeBtn = container.querySelector('[data-remove]')
		await fireEvent.click(removeBtn)

		expect(kavach.removeCachedLogin).toHaveBeenCalledWith('alice@example.com')
	})
})
